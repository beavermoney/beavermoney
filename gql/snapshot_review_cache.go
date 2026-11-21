package gql

import (
	"context"
	"fmt"
	"sort"
	"sync"

	"beavermoney.app/ent"
	"beavermoney.app/ent/snapshot"
	"beavermoney.app/ent/snapshotrate"
	"beavermoney.app/gql/model"
	"entgo.io/ent/dialect/sql"
	"github.com/99designs/gqlgen/graphql"
)

type snapshotReviewCacheKey struct{}
type snapshotReviewCache struct {
	sync.Mutex
	values map[int]*model.SnapshotReview
}

// One cache per GraphQL operation, never shared between households or requests.
// A chart's connection is loaded together rather than issuing queries per point.
func WithSnapshotReviewCache(ctx context.Context, next graphql.OperationHandler) graphql.ResponseHandler {
	return next(context.WithValue(ctx, snapshotReviewCacheKey{}, &snapshotReviewCache{values: map[int]*model.SnapshotReview{}}))
}

func cachedSnapshotReview(ctx context.Context, c *ent.Client, obj *ent.Snapshot) (*model.SnapshotReview, error) {
	cache, ok := ctx.Value(snapshotReviewCacheKey{}).(*snapshotReviewCache)
	if !ok {
		return resolveSnapshotReview(ctx, c, obj)
	}
	cache.Lock()
	defer cache.Unlock()
	if value, ok := cache.values[obj.ID]; ok {
		return value, nil
	}
	ids := []int{obj.ID}
	for fc := graphql.GetFieldContext(ctx); fc != nil; fc = fc.Parent {
		if connection, ok := fc.Result.(*ent.SnapshotConnection); ok {
			ids = nil
			for _, edge := range connection.Edges {
				if edge != nil && edge.Node != nil {
					ids = append(ids, edge.Node.ID)
				}
			}
			break
		}
	}
	values, err := loadSnapshotReviews(ctx, c, ids)
	if err != nil {
		return nil, err
	}
	for id, value := range values {
		cache.values[id] = value
	}
	value, ok := cache.values[obj.ID]
	if !ok {
		return nil, fmt.Errorf("snapshot not found")
	}
	return value, nil
}

func loadSnapshotReviews(ctx context.Context, c *ent.Client, ids []int) (map[int]*model.SnapshotReview, error) {
	stamps, err := c.Snapshot.Query().Where(snapshot.IDIn(ids...)).Order(ent.Asc(snapshot.FieldCreateTime), ent.Asc(snapshot.FieldID)).All(ctx)
	if err != nil {
		return nil, err
	}
	result := map[int]*model.SnapshotReview{}
	modern := []*ent.Snapshot{}
	for _, s := range stamps {
		result[s.ID] = nil
		if s.FormatVersion == 1 {
			modern = append(modern, s)
		}
	}
	if len(modern) == 0 {
		return result, nil
	}
	first, last := modern[0], modern[len(modern)-1]
	accounts, err := latestAccountObservations(ctx, c, first.CreateTime)
	if err != nil {
		return nil, err
	}
	investments, err := latestInvestmentObservations(ctx, c, first.CreateTime)
	if err != nil {
		return nil, err
	}
	// Only the first point's baseline plus changes inside the requested window.
	window := func(s *sql.Selector) {
		s.Where(sql.And(
			sql.GT(s.C("create_time"), first.CreateTime),
			sql.LTE(s.C("create_time"), last.CreateTime),
		))
	}
	changes, err := c.SnapshotAccount.Query().Modify(window).WithAccount(func(q *ent.AccountQuery) { q.WithUser().WithHouseholdCurrency() }).All(ctx)
	if err != nil {
		return nil, err
	}
	accounts = append(accounts, changes...)
	holdingChanges, err := c.SnapshotInvestment.Query().Modify(window).WithInvestment(func(q *ent.InvestmentQuery) { q.WithHouseholdCurrency() }).All(ctx)
	if err != nil {
		return nil, err
	}
	investments = append(investments, holdingChanges...)
	rates, err := c.SnapshotRate.Query().Where(snapshotrate.SnapshotIDIn(ids...)).WithFromCurrency().WithToCurrency().All(ctx)
	if err != nil {
		return nil, err
	}
	ratesByStamp := map[int][]*ent.SnapshotRate{}
	for _, r := range rates {
		ratesByStamp[r.SnapshotID] = append(ratesByStamp[r.SnapshotID], r)
	}
	sort.Slice(accounts, func(i, j int) bool {
		a, b := accounts[i], accounts[j]
		return a.CreateTime.Before(b.CreateTime)
	})
	sort.Slice(investments, func(i, j int) bool {
		a, b := investments[i], investments[j]
		return a.CreateTime.Before(b.CreateTime)
	})
	latestAccounts := map[int]*ent.SnapshotAccount{}
	latestInvestments := map[int]*ent.SnapshotInvestment{}
	ai, ii := 0, 0
	for _, s := range modern {
		for ai < len(accounts) {
			a := accounts[ai]
			if a.CreateTime.After(s.CreateTime) {
				break
			}
			latestAccounts[a.AccountID] = a
			ai++
		}
		for ii < len(investments) {
			i := investments[ii]
			if i.CreateTime.After(s.CreateTime) {
				break
			}
			latestInvestments[i.InvestmentID] = i
			ii++
		}
		aa := make([]*ent.SnapshotAccount, 0, len(latestAccounts))
		for _, a := range latestAccounts {
			aa = append(aa, a)
		}
		ii := make([]*ent.SnapshotInvestment, 0, len(latestInvestments))
		for _, i := range latestInvestments {
			ii = append(ii, i)
		}
		value, err := buildSnapshotReview(aa, ii, ratesByStamp[s.ID])
		if err != nil {
			return nil, err
		}
		result[s.ID] = value
	}
	return result, nil
}
