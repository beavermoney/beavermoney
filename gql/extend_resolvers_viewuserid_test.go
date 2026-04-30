package gql

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"io"
	"log/slog"
	"os"
	"strings"
	"testing"

	"beavermoney.app/cmd/server/database"
	"beavermoney.app/ent"
	_ "beavermoney.app/ent/runtime"
	"beavermoney.app/ent/userhousehold"
	"beavermoney.app/internal/contextkeys"
)

func uniqueSuffix(t *testing.T) string {
	t.Helper()
	buf := make([]byte, 8)
	if _, err := rand.Read(buf); err != nil {
		t.Fatalf("rand.Read: %v", err)
	}
	return hex.EncodeToString(buf)
}

func testPostgresURL() string {
	if v := os.Getenv("TEST_POSTGRES_URL"); v != "" {
		return v
	}
	if v := os.Getenv("POSTGRES_URL"); v != "" {
		return v
	}
	return "postgresql://user:password@localhost:2345/beavermoney?sslmode=disable"
}

func newTestResolver(t *testing.T) (*Resolver, *ent.Client, context.Context) {
	t.Helper()

	entClient, db, err := database.Connect(testPostgresURL())
	if err != nil {
		t.Skipf("postgres not available, skipping integration test: %v", err)
	}

	ctx := context.Background()
	bypassCtx := contextkeys.NewPrivacyBypassContext(ctx)

	if _, err := entClient.UserHousehold.Query().Limit(1).All(bypassCtx); err != nil {
		_ = entClient.Close()
		_ = db.Close()
		t.Skipf("schema not migrated, skipping: %v", err)
	}

	t.Cleanup(func() {
		_ = entClient.Close()
		_ = db.Close()
	})

	r := &Resolver{
		logger:    slog.New(slog.NewTextHandler(io.Discard, nil)),
		entClient: entClient,
	}

	return r, entClient, bypassCtx
}

func seedHouseholdWithUsers(
	t *testing.T,
	client *ent.Client,
	bypassCtx context.Context,
) (householdID, memberUserID, nonMemberUserID int) {
	t.Helper()

	suffix := uniqueSuffix(t)

	memberUser, err := client.User.Create().
		SetEmail("member-" + suffix + "@test.beavermoney.local").
		SetName("Test Member").
		Save(bypassCtx)
	if err != nil {
		t.Fatalf("create member user: %v", err)
	}

	nonMemberUser, err := client.User.Create().
		SetEmail("nonmember-" + suffix + "@test.beavermoney.local").
		SetName("Test NonMember").
		Save(bypassCtx)
	if err != nil {
		t.Fatalf("create non-member user: %v", err)
	}

	household, err := client.Household.Create().
		SetName("Test Household " + suffix).
		SetLocale("en-US").
		Save(bypassCtx)
	if err != nil {
		t.Fatalf("create household: %v", err)
	}

	householdScopedCtx := context.WithValue(
		bypassCtx,
		contextkeys.HouseholdIDKey(),
		household.ID,
	)

	hc, err := client.HouseholdCurrency.Create().
		SetCode("USD").
		SetImportant(true).
		SetHouseholdID(household.ID).
		Save(householdScopedCtx)
	if err != nil {
		t.Fatalf("create household currency: %v", err)
	}

	if _, err := client.UserHousehold.Create().
		SetUserID(memberUser.ID).
		SetHouseholdID(household.ID).
		SetRole(userhousehold.RoleAdmin).
		SetHouseholdCurrencyID(hc.ID).
		Save(householdScopedCtx); err != nil {
		t.Fatalf("create user_household: %v", err)
	}

	t.Cleanup(func() {
		ctx := contextkeys.NewPrivacyBypassContext(context.Background())
		ctx = context.WithValue(ctx, contextkeys.HouseholdIDKey(), household.ID)
		if _, err := client.UserHousehold.Delete().
			Where(
				userhousehold.HouseholdIDEQ(household.ID),
			).Exec(ctx); err != nil {
			t.Logf("cleanup user_households: %v", err)
		}
		if err := client.HouseholdCurrency.DeleteOneID(hc.ID).Exec(ctx); err != nil {
			t.Logf("cleanup household_currency: %v", err)
		}
		if err := client.Household.DeleteOneID(household.ID).Exec(ctx); err != nil {
			t.Logf("cleanup household: %v", err)
		}
		ctxAsMember := context.WithValue(ctx, contextkeys.UserIDKey(), memberUser.ID)
		if err := client.User.DeleteOneID(memberUser.ID).Exec(ctxAsMember); err != nil {
			t.Logf("cleanup member_user: %v", err)
		}
		ctxAsNonMember := context.WithValue(ctx, contextkeys.UserIDKey(), nonMemberUser.ID)
		if err := client.User.DeleteOneID(nonMemberUser.ID).Exec(ctxAsNonMember); err != nil {
			t.Logf("cleanup non_member_user: %v", err)
		}
	})

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
