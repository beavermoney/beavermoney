package gql

import (
	"context"
	"time"

	"beavermoney.app/ent/currency"
	"beavermoney.app/ent/household"
	"beavermoney.app/ent/transaction"
	"beavermoney.app/ent/transactioncategory"
	"beavermoney.app/ent/transactionentry"
	"beavermoney.app/gql/model"
	"beavermoney.app/internal/contextkeys"
	"entgo.io/ent/dialect/sql"
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

	// Get household currency
	hh, err := client.Household.Query().
		Where(household.IDEQ(householdID)).
		WithCurrency().
		Only(ctx)
	if err != nil {
		r.logger.Error("Failed to get household", "error", err)
		return nil, err
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
		rate, err := r.fxrateClient.GetRate(
			ctx,
			row.CurrencyCode,
			hh.Edges.Currency.Code,
			time.Now(),
		)
		if err != nil {
			r.logger.Error(
				"Failed to get FX rate",
				"error",
				err,
				"from",
				row.CurrencyCode,
				"to",
				hh.Edges.Currency.Code,
			)
			return nil, err
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
