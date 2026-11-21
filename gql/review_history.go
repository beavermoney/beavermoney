package gql

import (
	"beavermoney.app/ent/account"
	"beavermoney.app/ent/household"
	"beavermoney.app/ent/investment"
	"beavermoney.app/ent/snapshot"
	"beavermoney.app/gql/model"
	"beavermoney.app/internal/contextkeys"
	"beavermoney.app/internal/gqlutil"
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"regexp"
	"sort"
	"time"

	"beavermoney.app/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/dialect/sql"
	"github.com/shopspring/decimal"
)

type reviewHolding struct {
	ID          int        `json:"id"`
	Name        string     `json:"name"`
	Symbol      string     `json:"symbol"`
	Currency    string     `json:"currency"`
	Quantity    string     `json:"quantity"`
	Price       string     `json:"price"`
	Value       string     `json:"value"`
	Average     *string    `json:"average"`
	ConfirmedAt *time.Time `json:"confirmedAt"`
	NeedsReview bool       `json:"needsReview"`
}
type reviewAccount struct {
	ID        int             `json:"id"`
	Icon      *string         `json:"icon"`
	Name      string          `json:"name"`
	Type      string          `json:"type"`
	Category  *string         `json:"category"`
	OwnerID   int             `json:"ownerId"`
	OwnerName string          `json:"ownerName"`
	Currency  string          `json:"currency"`
	Cash      string          `json:"cash"`
	Value     string          `json:"value"`
	Holdings  []reviewHolding `json:"holdings"`
}

func averageNeedsReview(inv *ent.Investment) bool {
	if inv.Amount.IsZero() {
		return false
	}
	return inv.ConfirmedAverageCost == nil || inv.AverageCostConfirmedAt == nil ||
		(inv.HoldingsChangedAt != nil && !inv.AverageCostConfirmedAt.After(*inv.HoldingsChangedAt))
}

// Older versions allowed a member with only archived accounts to leave. Their
// user record is correctly hidden by privacy filtering, but their immutable
// account identity and financial history must remain readable. Do not bypass
// user privacy merely to recover a presentation label.
func reviewOwnerName(a *ent.Account) string {
	if a.Edges.User == nil {
		return ""
	}
	return a.Edges.User.Name
}

// Build a transient validation view. Persistence stores only normalized financial
// observations; names/icons remain current presentation metadata.
func captureReview(accounts []*ent.Account) ([]reviewAccount, error) {
	rows := make([]reviewAccount, 0, len(accounts))
	for _, a := range accounts {
		var category *string
		if a.Category != nil {
			v := string(*a.Category)
			category = &v
		}
		row := reviewAccount{ID: a.ID, Icon: a.Icon, Name: a.Name, Type: string(a.Type), Category: category, OwnerID: a.UserID, OwnerName: reviewOwnerName(a), Currency: a.Edges.HouseholdCurrency.Code, Cash: a.Balance.String(), Value: a.Value.String(), Holdings: []reviewHolding{}}
		for _, inv := range a.Edges.Investments {
			row.Holdings = append(row.Holdings, reviewHolding{ID: inv.ID, Name: inv.Name, Symbol: inv.Symbol, Currency: inv.Edges.HouseholdCurrency.Code, Quantity: inv.Amount.String(), Price: inv.Quote.String(), Value: inv.Value.String(), Average: inv.ConfirmedAverageCost, ConfirmedAt: inv.AverageCostConfirmedAt, NeedsReview: averageNeedsReview(inv)})
		}
		if a.Type != account.TypeInvestment {
			row.Cash = a.Value.String()
		}
		rows = append(rows, row)
	}
	return rows, nil
}

var quantityDecimal = regexp.MustCompile(`^-?\d{1,18}(\.\d{1,18})?$`)

var reviewDecimal = regexp.MustCompile(`^\d{1,18}(\.\d{1,18})?$`)

func confirmAverage(ctx context.Context, client *ent.Client, id int, value string, expectedAmount string, expectedChangedAt *time.Time) (*ent.Investment, error) {
	if !reviewDecimal.MatchString(value) || !quantityDecimal.MatchString(expectedAmount) {
		return nil, fmt.Errorf("enter a nonnegative average with at most 18 decimal places")
	}
	average, err := decimal.NewFromString(value)
	if err != nil || average.IsNegative() || average.Exponent() < -18 || average.GreaterThanOrEqual(decimal.New(1, 18)) {
		return nil, fmt.Errorf("average cost must be a nonnegative decimal")
	}
	amount, err := decimal.NewFromString(expectedAmount)
	if err != nil {
		return nil, fmt.Errorf("invalid expected quantity")
	}
	update := client.Investment.Update().Where(investment.IDEQ(id), investment.AmountEQ(amount), investment.ArchivedEQ(false))
	if expectedChangedAt == nil {
		update.Where(investment.HoldingsChangedAtIsNil())
	} else {
		update.Where(investment.HoldingsChangedAtEQ(*expectedChangedAt))
	}
	// Trade invalidation is timestamped by PostgreSQL. Its clock may be ahead
	// of the application clock, and PostgreSQL stores microsecond precision.
	// The conditional update above guarantees this is still the latest change;
	// a successful confirmation must be strictly later than that exact marker.
	confirmedAt := time.Now().UTC().Truncate(time.Microsecond)
	if expectedChangedAt != nil && !confirmedAt.After(*expectedChangedAt) {
		confirmedAt = expectedChangedAt.UTC().Add(time.Microsecond)
	}
	n, err := update.SetConfirmedAverageCost(average.String()).SetAverageCostConfirmedAt(confirmedAt).Save(ctx)
	if err != nil {
		return nil, err
	}
	if n != 1 {
		return nil, fmt.Errorf("this holding changed; reload it and confirm the current average cost")
	}
	return client.Investment.Get(ctx, id)
}

type reviewFX struct {
	From string `json:"from"`
	To   string `json:"to"`
	Rate string `json:"rate"`
}

// Existing-row edits can acquire investment then account locks through database
// triggers, while captures lock accounts before holdings. Serialize those edits
// with captures before taking either lock to avoid deadlock and mixed state.
// New transaction inserts already acquire the household FK lock before writing
// balances. SQLite test fixtures do not support row-level lock clauses.
func lockReviewState(ctx context.Context, client *ent.Client) error {
	_, err := client.Household.Query().Where(household.IDEQ(contextkeys.GetHouseholdID(ctx))).Modify(func(s *sql.Selector) {
		if s.Dialect() == dialect.Postgres {
			s.ForUpdate()
		}
	}).Only(ctx)
	return err
}

func (r *mutationResolver) createReview(ctx context.Context, input ent.CreateSnapshotInput, expected []*model.ReviewAccountVersion) (*ent.SnapshotEdge, error) {
	client := ent.FromContext(ctx)
	householdID := contextkeys.GetHouseholdID(ctx)
	// Serialize captures per household so deduplication and capture order are atomic.
	if err := lockReviewState(ctx, client); err != nil {
		return nil, err
	}
	previousAccounts, err := latestAccountObservations(ctx, client, time.Time{})
	if err != nil {
		return nil, err
	}
	previousInvestments, err := latestInvestmentObservations(ctx, client, time.Time{})
	if err != nil {
		return nil, err
	}
	activeAccountIDs := []int{}
	activeInvestmentIDs := []int{}
	for _, a := range previousAccounts {
		if !a.Archived {
			activeAccountIDs = append(activeAccountIDs, a.AccountID)
		}
	}
	for _, i := range previousInvestments {
		if !i.Archived {
			activeInvestmentIDs = append(activeInvestmentIDs, i.InvestmentID)
		}
	}
	// Include newly archived entities once; unchanged archived rows are skipped on later captures.
	accounts, err := client.Account.Query().Where(account.Or(account.ArchivedEQ(false), account.IDIn(activeAccountIDs...))).
		WithUser().WithHouseholdCurrency().WithInvestments(func(q *ent.InvestmentQuery) {
		q.Where(investment.Or(investment.ArchivedEQ(false), investment.IDIn(activeInvestmentIDs...))).WithHouseholdCurrency().Modify(func(s *sql.Selector) { s.ForUpdate() })
	}).Order(ent.Asc(account.FieldID)).Modify(func(s *sql.Selector) { s.ForUpdate() }).All(ctx)
	if err != nil {
		return nil, err
	}
	activeAccounts := []*ent.Account{}
	for _, a := range accounts {
		if !a.Archived {
			activeAccounts = append(activeAccounts, a)
		}
	}
	if len(accounts) == 0 && len(previousAccounts) == 0 {
		return nil, fmt.Errorf("add an account before saving a review")
	}
	stored, err := client.HouseholdRate.Query().Order(ent.Asc("id")).Modify(func(s *sql.Selector) { s.ForShare() }).All(ctx)
	if err != nil {
		return nil, err
	}
	if expected != nil {
		if len(expected) != len(activeAccounts) {
			return nil, fmt.Errorf("household accounts changed while you were reviewing; reopen the review to check all accounts")
		}
		revisions := map[int]string{}
		for _, v := range expected {
			revisions[v.ID] = v.Revision
		}
		for _, a := range activeAccounts {
			revision, err := accountReviewRevision(ctx, client, a)
			if err != nil {
				return nil, err
			}
			if revisions[a.ID] != revision {
				return nil, fmt.Errorf("an account changed while you were reviewing; reopen the review to check the latest values")
			}
		}
	}
	currencies, err := client.HouseholdCurrency.Query().All(ctx)
	if err != nil {
		return nil, err
	}
	sort.Slice(currencies, func(i, j int) bool { return currencies[i].Code < currencies[j].Code })

	rates := []reviewFX{}
	byPair := map[[2]int]*ent.HouseholdRate{}
	for _, rate := range stored {
		byPair[[2]int{rate.FromHouseholdCurrencyID, rate.ToHouseholdCurrencyID}] = rate
	}
	values := map[string]decimal.Decimal{}
	for _, from := range currencies {
		for _, to := range currencies {
			if from.ID == to.ID {
				continue
			}
			rate, ok := byPair[[2]int{from.ID, to.ID}]
			if !ok || !rate.Rate.IsPositive() {
				return nil, fmt.Errorf("missing FX for %s/%s; refresh account data before saving this review", from.Code, to.Code)
			}
			values[from.Code+"/"+to.Code] = rate.Rate
			rates = append(rates, reviewFX{from.Code, to.Code, rate.Rate.String()})
		}
	}
	rows, err := captureReview(accounts)
	if err != nil {
		return nil, err
	}
	// Revalue cash + each holding with exactly the rates preserved in this review.
	for i := range rows {
		total := decimal.RequireFromString(rows[i].Cash)
		for _, h := range rows[i].Holdings {
			rate := decimal.NewFromInt(1)
			if h.Currency != rows[i].Currency {
				rate = values[h.Currency+"/"+rows[i].Currency]
			}
			total = total.Add(decimal.RequireFromString(h.Value).Mul(rate))
		}
		if total.Sub(decimal.RequireFromString(rows[i].Value)).Abs().GreaterThan(decimal.RequireFromString("0.000001")) {
			return nil, fmt.Errorf("%s needs a balance refresh before its cash and holdings can be captured together", rows[i].Name)
		}
		rows[i].Value = total.String()
	}
	capturedAt := time.Now().UTC().Truncate(time.Microsecond)
	// Ensure timestamps remain ordered even if the system clock moves backwards.
	advance := func(t time.Time) {
		if !capturedAt.After(t) {
			capturedAt = t.Add(time.Microsecond)
		}
	}
	last, err := client.Snapshot.Query().Order(ent.Desc(snapshot.FieldCreateTime), ent.Desc(snapshot.FieldID)).First(ctx)
	if err != nil && !ent.IsNotFound(err) {
		return nil, err
	}
	if last != nil {
		advance(last.CreateTime)
	}
	for _, a := range previousAccounts {
		advance(a.CreateTime)
	}
	for _, i := range previousInvestments {
		advance(i.CreateTime)
	}
	snap, err := client.Snapshot.Create().SetHouseholdID(householdID).SetInput(input).SetFormatVersion(1).SetCreateTime(capturedAt).Save(ctx)
	if err != nil {
		return nil, err
	}
	if err := saveChangedObservations(ctx, client, snap, accounts, previousAccounts, previousInvestments); err != nil {
		return nil, err
	}
	currencyIDs := map[string]int{}
	for _, c := range currencies {
		currencyIDs[c.Code] = c.ID
	}
	for _, rate := range rates {
		if err := client.SnapshotRate.Create().SetHouseholdID(householdID).SetSnapshotID(snap.ID).SetFromCurrencyID(currencyIDs[rate.From]).SetToCurrencyID(currencyIDs[rate.To]).SetRate(decimal.RequireFromString(rate.Rate)).SetCreateTime(capturedAt).SetUpdateTime(capturedAt).Exec(ctx); err != nil {
			return nil, err
		}
	}
	return &ent.SnapshotEdge{Node: snap, Cursor: gqlutil.EncodeCursor(snap.ID)}, nil
}

// accountReviewRevision binds a review to the displayed financial state, including
// changed trade history even when its net effect on quantities is zero.
func accountReviewRevision(ctx context.Context, client *ent.Client, a *ent.Account) (string, error) {
	holdings, err := client.Investment.Query().Where(investment.AccountIDEQ(a.ID)).Order(ent.Asc(investment.FieldID)).All(ctx)
	if err != nil {
		return "", err
	}
	parts := []string{fmt.Sprint(a.ID), a.Name, string(a.Type), func() string {
		if a.Category == nil {
			return ""
		}
		return string(*a.Category)
	}(), a.Balance.String(), a.Value.String(), fmt.Sprint(a.UserID), fmt.Sprint(a.HouseholdCurrencyID)}
	for _, h := range holdings {
		average := ""
		if h.ConfirmedAverageCost != nil {
			average = *h.ConfirmedAverageCost
		}
		changed := ""
		if h.HoldingsChangedAt != nil {
			changed = h.HoldingsChangedAt.UTC().Format(time.RFC3339Nano)
		}
		confirmed := ""
		if h.AverageCostConfirmedAt != nil {
			confirmed = h.AverageCostConfirmedAt.UTC().Format(time.RFC3339Nano)
		}
		parts = append(parts, fmt.Sprint(h.ID), h.Name, h.Amount.String(), h.Quote.String(), average, changed, confirmed, fmt.Sprint(h.Archived))
	}
	rates, err := client.HouseholdRate.Query().Order(ent.Asc("id")).All(ctx)
	if err != nil {
		return "", err
	}
	for _, rate := range rates {
		parts = append(parts, fmt.Sprint(rate.FromHouseholdCurrencyID), fmt.Sprint(rate.ToHouseholdCurrencyID), rate.Rate.String())
	}
	raw, _ := json.Marshal(parts)
	return fmt.Sprintf("%x", sha256.Sum256(raw)), nil
}
