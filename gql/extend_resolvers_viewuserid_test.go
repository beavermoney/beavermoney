package gql

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"io"
	"log/slog"
	"strings"
	"testing"

	"beavermoney.app/ent"
	"beavermoney.app/ent/enttest"
	_ "beavermoney.app/ent/runtime"
	"beavermoney.app/ent/userhousehold"
	"beavermoney.app/internal/contextkeys"

	_ "github.com/mattn/go-sqlite3"
)

func uniqueSuffix(t *testing.T) string {
	t.Helper()
	buf := make([]byte, 8)
	if _, err := rand.Read(buf); err != nil {
		t.Fatalf("rand.Read: %v", err)
	}
	return hex.EncodeToString(buf)
}

func newTestResolver(t *testing.T) (*Resolver, *ent.Client, context.Context) {
	t.Helper()

	client := enttest.Open(
		t,
		"sqlite3",
		"file:"+t.Name()+"?mode=memory&cache=shared&_fk=1",
	)
	t.Cleanup(func() { _ = client.Close() })

	bypassCtx := contextkeys.NewPrivacyBypassContext(context.Background())

	r := &Resolver{
		logger:    slog.New(slog.NewTextHandler(io.Discard, nil)),
		entClient: client,
	}

	return r, client, bypassCtx
}

func seedHouseholdWithUsers(
	t *testing.T,
	client *ent.Client,
	bypassCtx context.Context,
) (householdID, memberUserID, nonMemberUserID int) {
	t.Helper()

	suffix := uniqueSuffix(t)

	memberUser := client.User.Create().
		SetEmail("member-" + suffix + "@test.beavermoney.local").
		SetName("Test Member").
		SaveX(bypassCtx)

	nonMemberUser := client.User.Create().
		SetEmail("nonmember-" + suffix + "@test.beavermoney.local").
		SetName("Test NonMember").
		SaveX(bypassCtx)

	household := client.Household.Create().
		SetName("Test Household " + suffix).
		SetLocale("en-US").
		SaveX(bypassCtx)

	householdScopedCtx := context.WithValue(
		bypassCtx,
		contextkeys.HouseholdIDKey(),
		household.ID,
	)

	hc := client.HouseholdCurrency.Create().
		SetCode("USD").
		SetImportant(true).
		SetHouseholdID(household.ID).
		SaveX(householdScopedCtx)

	client.UserHousehold.Create().
		SetUserID(memberUser.ID).
		SetHouseholdID(household.ID).
		SetRole(userhousehold.RoleAdmin).
		SetHouseholdCurrencyID(hc.ID).
		SaveX(householdScopedCtx)

	return household.ID, memberUser.ID, nonMemberUser.ID
}

func TestViewUserID_Nil_Returns_Nil(t *testing.T) {
	r := &Resolver{
		logger: slog.New(slog.NewTextHandler(io.Discard, nil)),
	}

	if err := r.validateViewUserID(context.Background(), 1, nil); err != nil {
		t.Fatalf("expected nil for nil viewUserID, got %v", err)
	}
}

func TestViewUserID_NonMemberReturnsError(t *testing.T) {
	r, client, bypassCtx := newTestResolver(t)
	householdID, _, nonMemberUserID := seedHouseholdWithUsers(t, client, bypassCtx)

	err := r.validateViewUserID(context.Background(), householdID, &nonMemberUserID)
	if err == nil {
		t.Fatalf("expected error for non-member viewUserID, got nil")
	}
	if !strings.Contains(err.Error(), "VIEW_USER_NOT_HOUSEHOLD_MEMBER") {
		t.Fatalf("expected VIEW_USER_NOT_HOUSEHOLD_MEMBER error, got %q", err.Error())
	}
}

func TestViewUserID_MemberReturnsNil(t *testing.T) {
	r, client, bypassCtx := newTestResolver(t)
	householdID, memberUserID, _ := seedHouseholdWithUsers(t, client, bypassCtx)

	if err := r.validateViewUserID(context.Background(), householdID, &memberUserID); err != nil {
		t.Fatalf("expected nil for member viewUserID, got %v", err)
	}
}

func TestViewUserID_DifferentHouseholdReturnsError(t *testing.T) {
	r, client, bypassCtx := newTestResolver(t)
	_, memberUserID, _ := seedHouseholdWithUsers(t, client, bypassCtx)

	otherHouseholdID, _, _ := seedHouseholdWithUsers(t, client, bypassCtx)

	err := r.validateViewUserID(context.Background(), otherHouseholdID, &memberUserID)
	if err == nil {
		t.Fatalf("expected error for cross-household viewUserID, got nil")
	}
	if !strings.Contains(err.Error(), "VIEW_USER_NOT_HOUSEHOLD_MEMBER") {
		t.Fatalf("expected VIEW_USER_NOT_HOUSEHOLD_MEMBER, got %q", err.Error())
	}
}
