package rules

import (
	"context"
	"errors"
	"testing"

	"beavermoney.app/ent/predicate"
	"beavermoney.app/ent/privacy"
	"beavermoney.app/internal/contextkeys"
	"entgo.io/ent/entql"
)

// Privacy rules attach WHERE clauses to query/mutation builders; these
// unit tests verify clause attachment. End-to-end admit/deny semantics
// against PostgreSQL are covered by the resolver tests in T28-T29.

type mockUserHouseholdFilter struct {
	whereHasHouseholdWithCalls int
	lastHouseholdPreds         []predicate.Household
}

func (m *mockUserHouseholdFilter) Where(_ entql.P) {}

func (m *mockUserHouseholdFilter) WhereHasHouseholdWith(preds ...predicate.Household) {
	m.whereHasHouseholdWithCalls++
	m.lastHouseholdPreds = preds
}

type incompatibleFilter struct{}

func (incompatibleFilter) Where(_ entql.P) {}

func invokeRule(t *testing.T, rule privacy.QueryMutationRule, ctx context.Context, f privacy.Filter) error {
	t.Helper()

	fn, ok := rule.(privacy.FilterFunc)
	if !ok {
		t.Fatalf("expected rule to be privacy.FilterFunc, got %T", rule)
	}

	return fn(ctx, f)
}

func ctxWithUser(uid int) context.Context {
	return context.WithValue(context.Background(), contextkeys.UserIDKey(), uid)
}

// AdminAllows: with an authenticated user, the rule attaches the admin-role
// predicate and returns Skip so the DB layer can narrow rows to admin-held
// households.
func TestFilterAdminOfTargetHousehold_AdminAllows(t *testing.T) {
	rule := FilterAdminOfTargetHousehold()
	mock := &mockUserHouseholdFilter{}

	err := invokeRule(t, rule, ctxWithUser(42), mock)

	if !errors.Is(err, privacy.Skip) {
		t.Fatalf("expected privacy.Skip for admin context, got %v", err)
	}
	if mock.whereHasHouseholdWithCalls != 1 {
		t.Fatalf("expected WhereHasHouseholdWith to be invoked exactly once, got %d", mock.whereHasHouseholdWithCalls)
	}
	if len(mock.lastHouseholdPreds) != 1 {
		t.Fatalf("expected exactly 1 household predicate (admin-role check), got %d", len(mock.lastHouseholdPreds))
	}
	if mock.lastHouseholdPreds[0] == nil {
		t.Fatal("expected a non-nil predicate enforcing the admin role")
	}
}

// MemberDenies: a filter that can't expose WhereHasHouseholdWith must be
// rejected so members (or any unsupported caller) can't bypass the
// admin-role predicate the DB relies on.
func TestFilterAdminOfTargetHousehold_MemberDenies(t *testing.T) {
	rule := FilterAdminOfTargetHousehold()

	err := invokeRule(t, rule, ctxWithUser(7), incompatibleFilter{})

	if err == nil {
		t.Fatal("expected non-nil deny error when filter is incompatible")
	}
	if errors.Is(err, privacy.Skip) || errors.Is(err, privacy.Allow) {
		t.Fatalf("expected deny error, got %v", err)
	}
}

// OutsiderDenies: missing user-id in context (e.g. JWT middleware absent)
// must hard-deny without ever touching the filter.
func TestFilterAdminOfTargetHousehold_OutsiderDenies(t *testing.T) {
	rule := FilterAdminOfTargetHousehold()
	mock := &mockUserHouseholdFilter{}

	err := invokeRule(t, rule, context.Background(), mock)

	if err == nil {
		t.Fatal("expected deny error for missing user context")
	}
	if errors.Is(err, privacy.Skip) || errors.Is(err, privacy.Allow) {
		t.Fatalf("expected deny error for unauthenticated caller, got %v", err)
	}
	if mock.whereHasHouseholdWithCalls != 0 {
		t.Fatalf("expected the filter to remain untouched when the caller is unauthenticated, got %d calls", mock.whereHasHouseholdWithCalls)
	}
}

// DemoBlocks: a non-bypass call attaches an is_demo=false predicate on the
// household edge so the DB rejects mutations on demo households.
func TestBlockDemoHouseholdMutation_DemoBlocks(t *testing.T) {
	rule := BlockDemoHouseholdMutation()
	mock := &mockUserHouseholdFilter{}

	err := invokeRule(t, rule, ctxWithUser(1), mock)

	if !errors.Is(err, privacy.Skip) {
		t.Fatalf("expected privacy.Skip after applying demo block, got %v", err)
	}
	if mock.whereHasHouseholdWithCalls != 1 {
		t.Fatalf("expected WhereHasHouseholdWith to be invoked exactly once (is_demo=false), got %d", mock.whereHasHouseholdWithCalls)
	}
	if len(mock.lastHouseholdPreds) != 1 {
		t.Fatalf("expected exactly 1 household predicate (is_demo=false), got %d", len(mock.lastHouseholdPreds))
	}
	if mock.lastHouseholdPreds[0] == nil {
		t.Fatal("expected a non-nil predicate enforcing is_demo=false")
	}
}

// NormalPasses: privacy bypass (used by seeding/internal tooling) must
// short-circuit without attaching the demo predicate, otherwise the seeder
// itself would be blocked from populating demo households.
func TestBlockDemoHouseholdMutation_NormalPasses(t *testing.T) {
	rule := BlockDemoHouseholdMutation()
	mock := &mockUserHouseholdFilter{}

	bypassCtx := contextkeys.NewPrivacyBypassContext(context.Background())
	err := invokeRule(t, rule, bypassCtx, mock)

	if !errors.Is(err, privacy.Skip) {
		t.Fatalf("expected privacy.Skip when privacy bypass is set, got %v", err)
	}
	if mock.whereHasHouseholdWithCalls != 0 {
		t.Fatalf("expected the demo filter to be skipped under privacy bypass, got %d call(s)", mock.whereHasHouseholdWithCalls)
	}
}
