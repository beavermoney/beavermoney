package gql

import (
	"context"
	"fmt"
	"strings"
	"time"

	"beavermoney.app/ent"
	"beavermoney.app/ent/account"
	"beavermoney.app/ent/householdcurrency"
	"beavermoney.app/ent/householdrate"
	"beavermoney.app/ent/investmentlot"
	"beavermoney.app/ent/snapshotrate"
	"beavermoney.app/ent/transaction"
	"beavermoney.app/ent/transactioncategory"
	"beavermoney.app/ent/transactionentry"
	"beavermoney.app/ent/userhousehold"
	"beavermoney.app/gql/model"
	"beavermoney.app/internal/contextkeys"
	"beavermoney.app/internal/frankfurter"
	"entgo.io/ent/dialect/sql"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/shopspring/decimal"
)

func (r *householdResolver) aggregateByCategoryType(
	ctx context.Context,
	obj *model.FinancialReport,
	categoryType transactioncategory.Type,
	viewUserIDs []int,
) (*model.CategoryTypeAggregate, error) {
	ctx, span := r.tracer.Start(
		ctx,
		"householdResolver.aggregateByCategoryType",
	)
	defer span.End()

	householdID := contextkeys.GetHouseholdID(ctx)

	client := r.entClient

	dc := contextkeys.GetDisplayCurrency(ctx)
	targetCurrencyCode := dc.Code

	// Query grouped by category and currency
	var res []struct {
		CategoryID   int             `sql:"category_id"`
		CurrencyCode string          `sql:"currency_code"`
		CurrencyID   int             `sql:"currency_id"`
		Total        decimal.Decimal `sql:"total"`
		Count        int             `sql:"count"`
	}

	err := client.Transaction.Query().
		Modify(func(s *sql.Selector) {
			te := sql.Table(transactionentry.Table)
			tc := sql.Table(transactioncategory.Table)
			ac := sql.Table(account.Table)
			cu := sql.Table(householdcurrency.Table)

			s.Join(te).
				On(s.C(transaction.FieldID), te.C(transactionentry.TransactionColumn))
			s.Join(tc).
				On(s.C(transaction.CategoryColumn), tc.C(transactioncategory.FieldID))
			s.Join(ac).
				On(te.C(transactionentry.AccountColumn), ac.C(account.FieldID))
			s.Join(cu).
				On(ac.C(account.HouseholdCurrencyColumn), cu.C(householdcurrency.FieldID))

			// Filter by household
			s.Where(sql.EQ(s.C(transaction.FieldHouseholdID), householdID))

			// Filter out excluded transactions
			s.Where(sql.EQ(s.C(transaction.FieldExcludeFromReports), false))

			// Entry-level (not transaction-level): SUM must reflect only
			// the selected owners' slices of multi-entry transactions.
			applyViewUserIDEntryFilter(s, te, viewUserIDs)

			// Apply time filters
			if !obj.StartDate.IsZero() {
				s.Where(sql.GTE(s.C(transaction.FieldDatetime), obj.StartDate))
			}
			if !obj.EndDate.IsZero() {
				s.Where(sql.LT(s.C(transaction.FieldDatetime), obj.EndDate))
			}

			// Filter for category type
			s.Where(sql.EQ(tc.C(transactioncategory.FieldType), categoryType))

			// Group by category and currency and sum
			s.Select(
				sql.As(tc.C(transactioncategory.FieldID), "category_id"),
				sql.As(cu.C(householdcurrency.FieldCode), "currency_code"),
				sql.As(cu.C(householdcurrency.FieldID), "currency_id"),
				sql.As(sql.Sum(te.C(transactionentry.FieldAmount)), "total"),
				sql.As(
					sql.Count(sql.Distinct(s.C(transaction.FieldID))),
					"count",
				),
			)
			s.GroupBy(
				tc.C(transactioncategory.FieldID),
				cu.C(householdcurrency.FieldCode),
				cu.C(householdcurrency.FieldID),
			)
		}).
		Scan(ctx, &res)
	if err != nil {
		r.logger.Error(
			"Failed to aggregate by category",
			"error",
			err,
			"categoryType",
			categoryType,
		)
		return nil, err
	}

	if len(res) == 0 {
		return &model.CategoryTypeAggregate{}, nil
	}

	// Aggregate by category (converting currencies)
	type categoryData struct {
		total decimal.Decimal
		count int
	}
	categoryMap := make(map[int]*categoryData)
	targetCurrencyID := dc.HouseholdCurrencyID

	sourceCurrencyIDs := make([]int, 0, len(res))
	seenSourceCurrencyIDs := make(map[int]bool, len(res))
	for _, row := range res {
		if row.CurrencyID == targetCurrencyID || seenSourceCurrencyIDs[row.CurrencyID] {
			continue
		}
		seenSourceCurrencyIDs[row.CurrencyID] = true
		sourceCurrencyIDs = append(sourceCurrencyIDs, row.CurrencyID)
	}

	rateByFromCurrencyID := make(map[int]decimal.Decimal, len(sourceCurrencyIDs))
	if len(sourceCurrencyIDs) > 0 {
		rates, err := client.HouseholdRate.Query().
			Where(
				householdrate.HouseholdIDEQ(householdID),
				householdrate.ToHouseholdCurrencyIDEQ(targetCurrencyID),
				householdrate.FromHouseholdCurrencyIDIn(sourceCurrencyIDs...),
			).
			All(ctx)
		if err != nil {
			r.logger.Error("Failed to load household FX rates", "error", err)
			return nil, err
		}
		for _, rate := range rates {
			rateByFromCurrencyID[rate.FromHouseholdCurrencyID] = rate.Rate
		}
	}

	for _, row := range res {
		rate := decimal.NewFromInt(1)
		if row.CurrencyID != targetCurrencyID {
			var ok bool
			rate, ok = rateByFromCurrencyID[row.CurrencyID]
			if !ok {
				err := fmt.Errorf(
					"missing household FX rate from %s to %s",
					row.CurrencyCode,
					targetCurrencyCode,
				)
				r.logger.Error(
					"Failed to convert category aggregate amount",
					"error",
					err,
					"from",
					row.CurrencyCode,
					"to",
					targetCurrencyCode,
				)
				return nil, err
			}
		}

		convertedTotal := row.Total.Mul(rate)

		if existing, ok := categoryMap[row.CategoryID]; ok {
			existing.total = existing.total.Add(convertedTotal)
			existing.count += row.Count
		} else {
			categoryMap[row.CategoryID] = &categoryData{
				total: convertedTotal,
				count: row.Count,
			}
		}
	}

	// Load category entities and build CategoryAggregate objects
	categoryIDs := make([]int, 0, len(categoryMap))
	for catID := range categoryMap {
		categoryIDs = append(categoryIDs, catID)
	}

	categories, err := client.TransactionCategory.Query().
		Where(transactioncategory.IDIn(categoryIDs...)).
		All(ctx)
	if err != nil {
		r.logger.Error("Failed to load categories", "error", err)
		return nil, err
	}

	// Build CategoryAggregate list
	categoryAggregates := make([]*model.CategoryAggregate, 0, len(categories))
	grandTotal := decimal.NewFromInt(0)
	grandCount := 0

	for _, cat := range categories {
		data := categoryMap[cat.ID]
		total := data.total
		if categoryType == transactioncategory.TypeExpense {
			total = total.Abs()
		}

		categoryAggregates = append(
			categoryAggregates,
			&model.CategoryAggregate{
				Category:         cat,
				Total:            total.String(),
				TransactionCount: data.count,
			},
		)

		grandTotal = grandTotal.Add(total)
		grandCount += data.count
	}

	return &model.CategoryTypeAggregate{
		CategoryType:     categoryType,
		Total:            grandTotal.String(),
		TransactionCount: grandCount,
		Categories:       categoryAggregates,
	}, nil
}

func (r *householdResolver) transactionCount(
	ctx context.Context,
	obj *model.FinancialReport,
	viewUserIDs []int,
) (int, error) {
	householdID := contextkeys.GetHouseholdID(ctx)

	query := r.entClient.Transaction.Query()
	if len(viewUserIDs) > 0 {
		query = query.Where(transaction.HasTransactionEntriesWith(
			transactionentry.HasAccountWith(
				account.UserIDIn(viewUserIDs...),
			),
		))
	}

	count, err := query.Modify(func(s *sql.Selector) {
		// Filter by household
		s.Where(sql.EQ(s.C(transaction.FieldHouseholdID), householdID))

		// Filter out excluded transactions
		s.Where(sql.EQ(s.C(transaction.FieldExcludeFromReports), false))

		// Apply time filters
		if !obj.StartDate.IsZero() {
			s.Where(sql.GTE(s.C(transaction.FieldDatetime), obj.StartDate))
		}
		if !obj.EndDate.IsZero() {
			s.Where(sql.LT(s.C(transaction.FieldDatetime), obj.EndDate))
		}
	}).Count(ctx)
	if err != nil {
		r.logger.Error("Failed to count transactions", "error", err)
		return 0, err
	}

	return count, nil
}

// applyViewUserIDEntryFilter restricts the joined transaction_entries (te) to
// rows whose account belongs to one of viewUserIDs. Use this in aggregations
// where SUM(te.amount) must reflect only the selected owners' slice of
// multi-entry transactions (e.g. expense/income with cross-user fees,
// transfers).
//
// For transaction-level inclusion (counts, lists), use the ent predicate
// directly: q.Where(transaction.HasTransactionEntriesWith(...)). That form is
// set-membership only — the outer SUM still sees every sibling entry, which
// is wrong when a transaction spans multiple users' accounts.
//
// Empty/nil viewUserIDs means "no filter" (combined view across all owners).
func applyViewUserIDEntryFilter(
	s *sql.Selector,
	te *sql.SelectTable,
	viewUserIDs []int,
) {
	if len(viewUserIDs) == 0 {
		return
	}
	a := sql.Table(account.Table)
	s.Join(a).On(te.C(transactionentry.AccountColumn), a.C(account.FieldID))
	values := make([]any, len(viewUserIDs))
	for i, id := range viewUserIDs {
		values[i] = id
	}
	s.Where(sql.In(a.C(account.FieldUserID), values...))
}

// validateMutationOwner enforces the two ownership invariants for any
// resolver that accepts an explicit owner user ID: (1) the authenticated
// caller must be a real user (synthetic joint users have no auth path and
// must never reach a mutation), and (2) the chosen ownerUserID must belong
// to the active household. Real members and synthetic joint users are both
// valid owner values.
func (r *Resolver) validateMutationOwner(
	ctx context.Context,
	householdID, ownerUserID int,
) error {
	callerID := contextkeys.GetUserID(ctx)
	bypassCtx := contextkeys.NewPrivacyBypassContext(ctx)

	caller, err := r.entClient.User.Get(bypassCtx, callerID)
	if err != nil {
		return err
	}
	if caller.IsSynthetic {
		return fmt.Errorf("SYNTHETIC_USER_AS_CALLER")
	}

	exists, err := r.entClient.UserHousehold.Query().
		Where(
			userhousehold.UserIDEQ(ownerUserID),
			userhousehold.HouseholdIDEQ(householdID),
		).
		Exist(bypassCtx)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("OWNER_NOT_HOUSEHOLD_MEMBER")
	}
	return nil
}

// validateViewUserIDs checks that every id in viewUserIDs is a member of the
// given household (real or synthetic). Empty/nil = combined view, returns nil.
// Returns VIEW_USER_NOT_HOUSEHOLD_MEMBER on the first non-member.
func (r *Resolver) validateViewUserIDs(
	ctx context.Context,
	householdID int,
	viewUserIDs []int,
) error {
	if len(viewUserIDs) == 0 {
		return nil
	}

	// Override active household so FilterByHousehold checks against the household
	// being validated (which may differ from the request's X-Household-ID for
	// cross-household Relay node fetches).
	queryCtx := context.WithValue(ctx, contextkeys.HouseholdIDKey(), householdID)

	matched, err := r.entClient.UserHousehold.Query().
		Where(
			userhousehold.UserIDIn(viewUserIDs...),
			userhousehold.HouseholdIDEQ(householdID),
		).
		Count(queryCtx)
	if err != nil {
		return err
	}
	if matched != len(viewUserIDs) {
		return fmt.Errorf("VIEW_USER_NOT_HOUSEHOLD_MEMBER")
	}
	return nil
}

func parseTimePeriod(period model.TimePeriodInput) (time.Time, time.Time) {
	// If dates provided, use them directly (client sends UTC)
	if !period.StartDate.IsZero() && !period.EndDate.IsZero() {
		return period.StartDate, period.EndDate
	}

	// If only startDate, use it to now
	if !period.StartDate.IsZero() {
		return period.StartDate, time.Now()
	}

	// If only endDate, use zero time (all time) to endDate
	if !period.EndDate.IsZero() {
		return time.Time{}, period.EndDate
	}

	// Default: all time
	return time.Time{}, time.Now()
}

func (r *mutationResolver) syncHouseholdRatesForCurrency(
	ctx context.Context,
	client *ent.Client,
	householdID int,
	newHC *ent.HouseholdCurrency,
	existingHCs []*ent.HouseholdCurrency,
) error {
	if len(existingHCs) == 0 {
		return nil
	}

	var quoteCodes []string
	codeToID := map[string]int{newHC.Code: newHC.ID}
	for _, hc := range existingHCs {
		quoteCodes = append(quoteCodes, hc.Code)
		codeToID[hc.Code] = hc.ID
	}

	var builders []*ent.HouseholdRateCreate
	quotes := strings.Join(quoteCodes, ",")

	resp, err := r.frankfurterClient.GetRatesWithResponse(ctx, &frankfurter.GetRatesParams{
		Base:   &newHC.Code,
		Quotes: &quotes,
	})
	if err != nil {
		return err
	}
	if resp.JSON200 != nil {
		for _, rate := range *resp.JSON200 {
			toID, ok := codeToID[rate.Quote]
			if !ok {
				continue
			}
			builders = append(builders,
				client.HouseholdRate.Create().
					SetHouseholdID(householdID).
					SetFromHouseholdCurrencyID(newHC.ID).
					SetToHouseholdCurrencyID(toID).
					SetRate(decimal.NewFromFloat32(rate.Rate).Round(6)),
				client.HouseholdRate.Create().
					SetHouseholdID(householdID).
					SetFromHouseholdCurrencyID(toID).
					SetToHouseholdCurrencyID(newHC.ID).
					SetRate(decimal.NewFromInt(1).Div(decimal.NewFromFloat32(rate.Rate)).Round(6)),
			)
		}
	}

	if len(builders) > 0 {
		return client.HouseholdRate.CreateBulk(builders...).
			OnConflict(
				sql.ConflictColumns(
					householdrate.FieldHouseholdID,
					householdrate.FieldFromHouseholdCurrencyID,
					householdrate.FieldToHouseholdCurrencyID,
				),
			).
			Ignore().
			Exec(ctx)
	}
	return nil
}

func (r *mutationResolver) backfillSnapshotRatesForCurrency(
	ctx context.Context,
	client *ent.Client,
	householdID int,
	newHC *ent.HouseholdCurrency,
	existingHCs []*ent.HouseholdCurrency,
) error {
	if len(existingHCs) == 0 {
		return nil
	}

	importantHCs := make([]*ent.HouseholdCurrency, 0)
	for _, hc := range existingHCs {
		if hc.Important {
			importantHCs = append(importantHCs, hc)
		}
	}
	if len(importantHCs) == 0 {
		return nil
	}

	snapshots, err := client.Snapshot.Query().All(ctx)
	if err != nil {
		return err
	}
	if len(snapshots) == 0 {
		return nil
	}

	codeToID := map[string]int{newHC.Code: newHC.ID}
	var quoteCodes []string
	for _, hc := range importantHCs {
		quoteCodes = append(quoteCodes, hc.Code)
		codeToID[hc.Code] = hc.ID
	}
	quotes := strings.Join(quoteCodes, ",")

	for _, snap := range snapshots {
		alreadyExists, err := client.SnapshotRate.Query().
			Where(
				snapshotrate.SnapshotIDEQ(snap.ID),
				snapshotrate.Or(
					snapshotrate.FromHouseholdCurrencyIDEQ(newHC.ID),
					snapshotrate.ToHouseholdCurrencyIDEQ(newHC.ID),
				),
			).
			Exist(ctx)
		if err != nil {
			return err
		}
		if alreadyExists {
			continue
		}

		date := openapi_types.Date{Time: snap.CreateTime}
		resp, err := r.frankfurterClient.GetRatesWithResponse(ctx, &frankfurter.GetRatesParams{
			Date:   &date,
			Base:   &newHC.Code,
			Quotes: &quotes,
		})
		if err != nil {
			r.logger.Error(
				"Failed to fetch historical rates for snapshot",
				"error",
				err,
				"snapshotID",
				snap.ID,
			)
			continue
		}
		if resp.JSON200 == nil {
			continue
		}

		var builders []*ent.SnapshotRateCreate
		for _, rate := range *resp.JSON200 {
			toID, ok := codeToID[rate.Quote]
			if !ok {
				continue
			}
			builders = append(builders,
				client.SnapshotRate.Create().
					SetHouseholdID(householdID).
					SetSnapshotID(snap.ID).
					SetFromHouseholdCurrencyID(newHC.ID).
					SetToHouseholdCurrencyID(toID).
					SetRate(decimal.NewFromFloat32(rate.Rate).Round(6)),
				client.SnapshotRate.Create().
					SetHouseholdID(householdID).
					SetSnapshotID(snap.ID).
					SetFromHouseholdCurrencyID(toID).
					SetToHouseholdCurrencyID(newHC.ID).
					SetRate(decimal.NewFromInt(1).Div(decimal.NewFromFloat32(rate.Rate)).Round(6)),
			)
		}

		if len(builders) > 0 {
			err = client.SnapshotRate.CreateBulk(builders...).
				OnConflict(
					sql.ConflictColumns(
						snapshotrate.FieldSnapshotID,
						snapshotrate.FieldFromHouseholdCurrencyID,
						snapshotrate.FieldToHouseholdCurrencyID,
					),
				).
				Ignore().
				Exec(ctx)
			if err != nil {
				r.logger.Error(
					"Failed to create snapshot rates",
					"error",
					err,
					"snapshotID",
					snap.ID,
				)
				continue
			}
		}
	}

	return nil
}

func (r *mutationResolver) syncHouseholdCurrenciesFromAccounts(
	ctx context.Context,
	client *ent.Client,
	hh *ent.Household,
	primaryHC *ent.HouseholdCurrency,
) error {
	accounts, err := client.Account.Query().
		Where(account.HouseholdIDEQ(hh.ID)).
		All(ctx)
	if err != nil {
		return err
	}

	seen := map[string]bool{}
	allHCs := []*ent.HouseholdCurrency{primaryHC}
	for _, acc := range accounts {
		hc, err := acc.QueryHouseholdCurrency().Only(ctx)
		if err != nil {
			return err
		}
		if seen[hc.Code] {
			continue
		}
		seen[hc.Code] = true
		allHCs = append(allHCs, hc)
	}

	if len(allHCs) <= 1 {
		return nil
	}

	for _, hc := range allHCs[1:] {
		existing := make([]*ent.HouseholdCurrency, 0, len(allHCs)-1)
		for _, other := range allHCs {
			if other.ID != hc.ID {
				existing = append(existing, other)
			}
		}
		if err := r.syncHouseholdRatesForCurrency(ctx, client, hh.ID, hc, existing); err != nil {
			r.logger.Error(
				"Failed to sync rates for currency",
				"error",
				err,
				"householdCurrencyID",
				hc.ID,
			)
		}
	}

	return nil
}

func (r *mutationResolver) refreshHouseholdRates(
	ctx context.Context,
	client *ent.Client,
	householdID int,
) error {
	hcs, err := client.HouseholdCurrency.Query().
		Where(householdcurrency.HouseholdIDEQ(householdID)).
		All(ctx)
	if err != nil {
		return fmt.Errorf("failed to query household currencies: %w", err)
	}
	if len(hcs) < 2 {
		return nil
	}

	codeToID := make(map[string]int, len(hcs))
	for _, hc := range hcs {
		codeToID[hc.Code] = hc.ID
	}

	var builders []*ent.HouseholdRateCreate
	for _, from := range hcs {
		var quoteCodes []string
		for _, to := range hcs {
			if to.ID != from.ID {
				quoteCodes = append(quoteCodes, to.Code)
			}
		}
		quotes := strings.Join(quoteCodes, ",")
		resp, err := r.frankfurterClient.GetRatesWithResponse(ctx, &frankfurter.GetRatesParams{
			Base:   &from.Code,
			Quotes: &quotes,
		})
		if err != nil {
			return fmt.Errorf("failed to fetch rates for %s: %w", from.Code, err)
		}
		if resp.JSON200 == nil {
			continue
		}
		for _, rate := range *resp.JSON200 {
			toID, ok := codeToID[rate.Quote]
			if !ok {
				continue
			}
			builders = append(builders, client.HouseholdRate.Create().
				SetHouseholdID(householdID).
				SetFromHouseholdCurrencyID(from.ID).
				SetToHouseholdCurrencyID(toID).
				SetRate(decimal.NewFromFloat32(rate.Rate).Round(6)),
			)
		}
	}

	if len(builders) == 0 {
		return nil
	}

	return client.HouseholdRate.CreateBulk(builders...).
		OnConflict(
			sql.ConflictColumns(
				householdrate.FieldHouseholdID,
				householdrate.FieldFromHouseholdCurrencyID,
				householdrate.FieldToHouseholdCurrencyID,
			),
		).
		UpdateNewValues().
		Exec(ctx)
}

// computeAvgCostBasis replays the investment's lots in chronological order using
// the moving-average-cost method and returns (cost_basis, shares_held).
//
// Algorithm per lot:
//   - Buy (positive amount):  basis += amount * price; shares += amount
//   - Sell (negative amount): basis += amount * (basis/shares); shares += amount
//     (sells reduce basis at the current average, not at the sell price, so
//     realized gains/losses are excluded)
//   - Zero-amount lots are skipped defensively.
//
// Performance note: this issues one query per call. Each computed field on
// Investment that uses this helper triggers an independent query, so a
// portfolio query that selects all four return fields hits investment_lots four
// times per investment. For larger portfolios consider request-scoped caching
// or a dataloader; that's an optimization for when reads become a bottleneck.
func (r *investmentResolver) computeAvgCostBasis(
	ctx context.Context,
	obj *ent.Investment,
) (decimal.Decimal, decimal.Decimal, error) {
	lots, err := obj.QueryInvestmentLots().
		Order(
			ent.Asc(investmentlot.FieldCreateTime),
			ent.Asc(investmentlot.FieldID),
		).
		All(ctx)
	if err != nil {
		return decimal.Zero, decimal.Zero, err
	}

	basis := decimal.Zero
	shares := decimal.Zero
	for _, lot := range lots {
		switch {
		case lot.Amount.IsPositive():
			basis = basis.Add(lot.Amount.Mul(lot.Price))
			shares = shares.Add(lot.Amount)
		case lot.Amount.IsNegative():
			if shares.IsPositive() {
				avg := basis.Div(shares)
				// lot.Amount is negative, so this subtracts proportionally.
				basis = basis.Add(lot.Amount.Mul(avg))
			}
			shares = shares.Add(lot.Amount)
		}
	}

	// Defensive: clamp tiny negative residuals from decimal arithmetic to zero.
	if basis.IsNegative() {
		basis = decimal.Zero
	}
	return basis, shares, nil
}

const syntheticJointUserName = "Joint"

// countHouseholdMembers returns the real and synthetic user counts for a
// household. The ctx must allow reading User rows that are not co-members of
// the caller (e.g. privacy-bypass), otherwise FilterMeOrCoMember hides them.
func (r *Resolver) countHouseholdMembers(ctx context.Context, householdID int) (real int, synthetic int, err error) {
	rows, err := r.entClient.UserHousehold.Query().
		Where(userhousehold.HouseholdIDEQ(householdID)).
		WithUser().
		All(ctx)
	if err != nil {
		return 0, 0, err
	}
	for _, uh := range rows {
		if uh.Edges.User == nil {
			continue
		}
		if uh.Edges.User.IsSynthetic {
			synthetic++
		} else {
			real++
		}
	}
	return real, synthetic, nil
}
