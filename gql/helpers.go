package gql

import (
	"context"
	"fmt"
	"strings"
	"time"

	"beavermoney.app/ent"
	"beavermoney.app/ent/account"
	"beavermoney.app/ent/currency"
	"beavermoney.app/ent/household"
	"beavermoney.app/ent/householdcurrency"
	"beavermoney.app/ent/householdrate"
	"beavermoney.app/ent/snapshotrate"
	"beavermoney.app/ent/transaction"
	"beavermoney.app/ent/transactioncategory"
	"beavermoney.app/ent/transactionentry"
	"beavermoney.app/gql/model"
	"beavermoney.app/internal/contextkeys"
	"beavermoney.app/internal/frankfurter"
	"entgo.io/ent/dialect/sql"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/shopspring/decimal"
)

func (r *financialReportResolver) aggregateByCategoryType(
	ctx context.Context,
	obj *model.FinancialReport,
	categoryType transactioncategory.Type,
) (*model.CategoryTypeAggregate, error) {
	ctx, span := r.tracer.Start(
		ctx,
		"financialReportResolver.aggregateByCategoryType",
	)
	defer span.End()

	householdID := contextkeys.GetHouseholdID(ctx)

	client := r.entClient

	dc := contextkeys.GetDisplayCurrency(ctx)
	var (
		targetCurrencyCode string
		err                error
	)
	if dc != nil {
		targetCurrencyCode = dc.Code
	} else {
		hh, err := client.Household.Query().
			Where(household.IDEQ(householdID)).
			WithCurrency().
			Only(ctx)
		if err != nil {
			r.logger.Error("Failed to get household", "error", err)
			return nil, err
		}
		targetCurrencyCode = hh.Edges.Currency.Code
	}

	// Query grouped by category and currency
	var res []struct {
		CategoryID   int             `sql:"category_id"`
		CurrencyCode string          `sql:"currency_code"`
		Total        decimal.Decimal `sql:"total"`
		Count        int             `sql:"count"`
	}

	err = client.Transaction.Query().
		Modify(func(s *sql.Selector) {
			te := sql.Table(transactionentry.Table)
			tc := sql.Table(transactioncategory.Table)
			cu := sql.Table(currency.Table)

			// Join tables
			s.Join(te).
				On(s.C(transaction.FieldID), te.C(transactionentry.TransactionColumn))
			s.Join(tc).
				On(s.C(transaction.CategoryColumn), tc.C(transactioncategory.FieldID))
			s.Join(cu).
				On(te.C(transactionentry.CurrencyColumn), cu.C(currency.FieldID))

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

			// Filter for category type
			s.Where(sql.EQ(tc.C(transactioncategory.FieldType), categoryType))

			// Group by category and currency and sum
			s.Select(
				sql.As(tc.C(transactioncategory.FieldID), "category_id"),
				sql.As(cu.C(currency.FieldCode), "currency_code"),
				sql.As(sql.Sum(te.C(transactionentry.FieldAmount)), "total"),
				sql.As(
					sql.Count(sql.Distinct(s.C(transaction.FieldID))),
					"count",
				),
			)
			s.GroupBy(
				tc.C(transactioncategory.FieldID),
				cu.C(currency.FieldCode),
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

	for _, row := range res {
		rate := decimal.NewFromInt(1)
		if row.CurrencyCode != targetCurrencyCode {
			date := openapi_types.Date{Time: time.Now().UTC()}
			resp, err := r.frankfurterClient.GetRateWithResponse(
				ctx,
				row.CurrencyCode,
				targetCurrencyCode,
				&frankfurter.GetRateParams{Date: &date},
			)
			if err != nil {
				r.logger.Error(
					"Failed to get FX rate",
					"error",
					err,
					"from",
					row.CurrencyCode,
					"to",
					targetCurrencyCode,
				)
				return nil, err
			}

			if resp.JSON200 == nil {
				err = fmt.Errorf("failed to get FX rate: unexpected status %s", resp.Status())
				r.logger.Error(
					"Failed to get FX rate",
					"error",
					err,
					"from",
					row.CurrencyCode,
					"to",
					targetCurrencyCode,
				)
				return nil, err
			}

			rate = decimal.NewFromFloat32(resp.JSON200.Rate)
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
	newCurrency *ent.Currency,
	existingHCs []*ent.HouseholdCurrency,
) error {
	if len(existingHCs) == 0 {
		return nil
	}

	var quoteCodes []string
	codeToID := map[string]int{newCurrency.Code: newCurrency.ID}
	for _, hc := range existingHCs {
		quoteCodes = append(quoteCodes, hc.Edges.Currency.Code)
		codeToID[hc.Edges.Currency.Code] = hc.CurrencyID
	}

	var builders []*ent.HouseholdRateCreate
	quotes := strings.Join(quoteCodes, ",")

	resp, err := r.frankfurterClient.GetRatesWithResponse(ctx, &frankfurter.GetRatesParams{
		Base:   &newCurrency.Code,
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
					SetFromCurrencyID(newCurrency.ID).
					SetToCurrencyID(toID).
					SetRate(decimal.NewFromFloat32(rate.Rate).Round(6)),
				client.HouseholdRate.Create().
					SetHouseholdID(householdID).
					SetFromCurrencyID(toID).
					SetToCurrencyID(newCurrency.ID).
					SetRate(decimal.NewFromInt(1).Div(decimal.NewFromFloat32(rate.Rate)).Round(6)),
			)
		}
	}

	if len(builders) > 0 {
		return client.HouseholdRate.CreateBulk(builders...).
			OnConflict(
				sql.ConflictColumns(
					householdrate.FieldHouseholdID,
					householdrate.FieldFromCurrencyID,
					householdrate.FieldToCurrencyID,
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
	newCurrency *ent.Currency,
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

	codeToID := map[string]int{newCurrency.Code: newCurrency.ID}
	var quoteCodes []string
	for _, hc := range importantHCs {
		quoteCodes = append(quoteCodes, hc.Edges.Currency.Code)
		codeToID[hc.Edges.Currency.Code] = hc.CurrencyID
	}
	quotes := strings.Join(quoteCodes, ",")

	for _, snap := range snapshots {
		alreadyExists, err := client.SnapshotRate.Query().
			Where(
				snapshotrate.SnapshotIDEQ(snap.ID),
				snapshotrate.Or(
					snapshotrate.FromCurrencyIDEQ(newCurrency.ID),
					snapshotrate.ToCurrencyIDEQ(newCurrency.ID),
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
			Base:   &newCurrency.Code,
			Quotes: &quotes,
		})
		if err != nil {
			r.logger.Error("Failed to fetch historical rates for snapshot", "error", err, "snapshotID", snap.ID)
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
					SetSnapshotID(snap.ID).
					SetFromCurrencyID(newCurrency.ID).
					SetToCurrencyID(toID).
					SetRate(decimal.NewFromFloat32(rate.Rate).Round(6)),
				client.SnapshotRate.Create().
					SetSnapshotID(snap.ID).
					SetFromCurrencyID(toID).
					SetToCurrencyID(newCurrency.ID).
					SetRate(decimal.NewFromInt(1).Div(decimal.NewFromFloat32(rate.Rate)).Round(6)),
			)
		}

		if len(builders) > 0 {
			err = client.SnapshotRate.CreateBulk(builders...).
				OnConflict(
					sql.ConflictColumns(
						snapshotrate.FieldSnapshotID,
						snapshotrate.FieldFromCurrencyID,
						snapshotrate.FieldToCurrencyID,
					),
				).
				Ignore().
				Exec(ctx)
			if err != nil {
				r.logger.Error("Failed to create snapshot rates", "error", err, "snapshotID", snap.ID)
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
		WithCurrency().
		All(ctx)
	if err != nil {
		return err
	}

	seen := map[int]bool{hh.CurrencyID: true}
	var newHCs []*ent.HouseholdCurrency
	for _, acc := range accounts {
		if seen[acc.CurrencyID] {
			continue
		}
		seen[acc.CurrencyID] = true
		hcID, err := client.HouseholdCurrency.Create().
			SetHouseholdID(hh.ID).
			SetCurrencyID(acc.CurrencyID).
			SetImportant(true).
			OnConflict(
				sql.ConflictColumns(householdcurrency.FieldHouseholdID, householdcurrency.FieldCurrencyID),
			).
			Ignore().
			ID(ctx)
		if err != nil {
			return err
		}
		newHCs = append(newHCs, &ent.HouseholdCurrency{
			ID:         hcID,
			CurrencyID: acc.CurrencyID,
			Edges: ent.HouseholdCurrencyEdges{
				Currency: acc.Edges.Currency,
			},
		})
	}

	if len(newHCs) == 0 {
		return nil
	}

	primaryHC.Edges.Currency, err = client.Currency.Get(ctx, hh.CurrencyID)
	if err != nil {
		return err
	}
	allHCs := append([]*ent.HouseholdCurrency{primaryHC}, newHCs...)

	for _, hc := range newHCs {
		existing := make([]*ent.HouseholdCurrency, 0, len(allHCs)-1)
		for _, other := range allHCs {
			if other.ID != hc.ID {
				existing = append(existing, other)
			}
		}
		if err := r.syncHouseholdRatesForCurrency(ctx, client, hh.ID, hc.Edges.Currency, existing); err != nil {
			r.logger.Error("Failed to sync rates for currency", "error", err, "currencyID", hc.CurrencyID)
		}
	}

	return nil
}
