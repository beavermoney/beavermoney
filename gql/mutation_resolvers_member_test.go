package gql

import (
	"context"
	"io"
	"log/slog"
	"strings"
	"testing"

	"beavermoney.app/ent"
	"beavermoney.app/ent/enttest"
	"beavermoney.app/ent/userhousehold"
	"beavermoney.app/gql/model"
	"beavermoney.app/internal/contextkeys"

	entcore "entgo.io/ent"
	"go.opentelemetry.io/otel/trace/noop"

	_ "github.com/mattn/go-sqlite3"
)

type memberTestFixture struct {
	client *ent.Client

	adminUser     *ent.User
	memberUser    *ent.User
	nonMemberUser *ent.User
	targetUser    *ent.User

	household      *ent.Household
	demoHousehold  *ent.Household
	otherHousehold *ent.Household

	primaryCurrency *ent.HouseholdCurrency
	demoCurrency    *ent.HouseholdCurrency
	otherCurrency   *ent.HouseholdCurrency

	adminUH     *ent.UserHousehold
	memberUH    *ent.UserHousehold
	demoAdminUH *ent.UserHousehold
}

func setupMemberFixture(t *testing.T) *memberTestFixture {
	t.Helper()

	client := enttest.Open(
		t,
		"sqlite3",
		"file:ent?mode=memory&cache=shared&_fk=1",
	)
	t.Cleanup(func() { _ = client.Close() })

	bypass := contextkeys.NewPrivacyBypassContext(context.Background())

	admin := client.User.Create().
		SetEmail("admin@bm.test").
		SetName("Admin").
		SaveX(bypass)
	member := client.User.Create().
		SetEmail("member@bm.test").
		SetName("Member").
		SaveX(bypass)
	nonMember := client.User.Create().
		SetEmail("nonmember@bm.test").
		SetName("NonMember").
		SaveX(bypass)
	target := client.User.Create().
		SetEmail("target@bm.test").
		SetName("Target").
		SaveX(bypass)

	household := client.Household.Create().
		SetName("Test Household").
		SetLocale("en-US").
		SaveX(bypass)
	householdCtx := context.WithValue(
		bypass,
		contextkeys.HouseholdIDKey(),
		household.ID,
	)
	primaryHC := client.HouseholdCurrency.Create().
		SetHouseholdID(household.ID).
		SetCode("USD").
		SetImportant(true).
		SaveX(householdCtx)

	adminUH := client.UserHousehold.Create().
		SetUserID(admin.ID).
		SetHouseholdID(household.ID).
		SetRole(userhousehold.RoleAdmin).
		SetHouseholdCurrencyID(primaryHC.ID).
		SaveX(bypass)
	memberUH := client.UserHousehold.Create().
		SetUserID(member.ID).
		SetHouseholdID(household.ID).
		SetRole(userhousehold.RoleMember).
		SetHouseholdCurrencyID(primaryHC.ID).
		SaveX(bypass)

	demo := client.Household.Create().
		SetName("Demo Household").
		SetLocale("en-US").
		SetIsDemo(true).
		SaveX(bypass)
	demoCtx := context.WithValue(
		bypass,
		contextkeys.HouseholdIDKey(),
		demo.ID,
	)
	demoHC := client.HouseholdCurrency.Create().
		SetHouseholdID(demo.ID).
		SetCode("USD").
		SetImportant(true).
		SaveX(demoCtx)
	demoAdminUH := client.UserHousehold.Create().
		SetUserID(admin.ID).
		SetHouseholdID(demo.ID).
		SetRole(userhousehold.RoleAdmin).
		SetHouseholdCurrencyID(demoHC.ID).
		SaveX(bypass)

	other := client.Household.Create().
		SetName("Other Household").
		SetLocale("en-US").
		SaveX(bypass)
	otherCtx := context.WithValue(
		bypass,
		contextkeys.HouseholdIDKey(),
		other.ID,
	)
	otherHC := client.HouseholdCurrency.Create().
		SetHouseholdID(other.ID).
		SetCode("EUR").
		SetImportant(true).
		SaveX(otherCtx)

	return &memberTestFixture{
		client:          client,
		adminUser:       admin,
		memberUser:      member,
		nonMemberUser:   nonMember,
		targetUser:      target,
		household:       household,
		demoHousehold:   demo,
		otherHousehold:  other,
		primaryCurrency: primaryHC,
		demoCurrency:    demoHC,
		otherCurrency:   otherHC,
		adminUH:         adminUH,
		memberUH:        memberUH,
		demoAdminUH:     demoAdminUH,
	}
}

func newMemberTestResolver(client *ent.Client) *Resolver {
	return &Resolver{
		logger:    slog.New(slog.NewTextHandler(io.Discard, nil)),
		entClient: client,
		tracer:    noop.NewTracerProvider().Tracer("test"),
	}
}

func memberCallCtx(
	client *ent.Client,
	userID, householdID int,
) context.Context {
	ctx := ent.NewContext(context.Background(), client)
	ctx = context.WithValue(ctx, contextkeys.UserIDKey(), userID)
	ctx = context.WithValue(ctx, contextkeys.HouseholdIDKey(), householdID)
	return ctx
}

func callAddHouseholdUser(
	ctx context.Context,
	r *Resolver,
	input model.AddHouseholdUserInput,
) (*ent.UserHousehold, error) {
	mr := &mutationResolver{Resolver: r}
	return mr.AddHouseholdUser(ctx, input)
}

func requireErrorContains(t *testing.T, err error, code string) {
	t.Helper()
	if err == nil {
		t.Fatalf("expected error containing %q, got nil", code)
	}
	if !strings.Contains(err.Error(), code) {
		t.Fatalf("expected error containing %q, got %q", code, err.Error())
	}
}

func TestAddHouseholdUser_HappyPath(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)

	uh, err := callAddHouseholdUser(ctx, r, model.AddHouseholdUserInput{
		Email:               f.targetUser.Email,
		Role:                userhousehold.RoleMember,
		HouseholdCurrencyID: f.primaryCurrency.ID,
	})
	if err != nil {
		t.Fatalf("expected success, got error: %v", err)
	}
	if uh == nil {
		t.Fatal("expected created UserHousehold, got nil")
	}
	if uh.UserID != f.targetUser.ID {
		t.Errorf(
			"expected UserID=%d, got %d",
			f.targetUser.ID,
			uh.UserID,
		)
	}
	if uh.HouseholdID != f.household.ID {
		t.Errorf(
			"expected HouseholdID=%d, got %d",
			f.household.ID,
			uh.HouseholdID,
		)
	}
	if uh.Role != userhousehold.RoleMember {
		t.Errorf("expected Role=member, got %q", uh.Role)
	}
	if uh.HouseholdCurrencyID != f.primaryCurrency.ID {
		t.Errorf(
			"expected HouseholdCurrencyID=%d, got %d",
			f.primaryCurrency.ID,
			uh.HouseholdCurrencyID,
		)
	}
}

func TestAddHouseholdUser_EmailNotRegistered(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)

	_, err := callAddHouseholdUser(ctx, r, model.AddHouseholdUserInput{
		Email:               "ghost@bm.test",
		Role:                userhousehold.RoleMember,
		HouseholdCurrencyID: f.primaryCurrency.ID,
	})
	requireErrorContains(t, err, "MEMBER_EMAIL_NOT_REGISTERED")
}

func TestAddHouseholdUser_AlreadyMember(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)

	_, err := callAddHouseholdUser(ctx, r, model.AddHouseholdUserInput{
		Email:               f.memberUser.Email,
		Role:                userhousehold.RoleMember,
		HouseholdCurrencyID: f.primaryCurrency.ID,
	})
	requireErrorContains(t, err, "MEMBER_ALREADY_EXISTS")
}

func TestAddHouseholdUser_NonAdminDenied(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.memberUser.ID, f.household.ID)

	_, err := callAddHouseholdUser(ctx, r, model.AddHouseholdUserInput{
		Email:               f.targetUser.Email,
		Role:                userhousehold.RoleMember,
		HouseholdCurrencyID: f.primaryCurrency.ID,
	})
	requireErrorContains(t, err, "NOT_HOUSEHOLD_ADMIN")
}

func TestAddHouseholdUser_NonMemberCallerDenied(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.nonMemberUser.ID, f.household.ID)

	_, err := callAddHouseholdUser(ctx, r, model.AddHouseholdUserInput{
		Email:               f.targetUser.Email,
		Role:                userhousehold.RoleMember,
		HouseholdCurrencyID: f.primaryCurrency.ID,
	})
	requireErrorContains(t, err, "NOT_HOUSEHOLD_ADMIN")
}

func TestAddHouseholdUser_DemoHouseholdBlocked(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.demoHousehold.ID)

	_, err := callAddHouseholdUser(ctx, r, model.AddHouseholdUserInput{
		Email:               f.targetUser.Email,
		Role:                userhousehold.RoleMember,
		HouseholdCurrencyID: f.demoCurrency.ID,
	})
	requireErrorContains(t, err, "MEMBER_MUTATION_LOCKED_ON_DEMO_HOUSEHOLD")
}

func TestAddHouseholdUser_EmailCaseInsensitive(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)

	uh, err := callAddHouseholdUser(ctx, r, model.AddHouseholdUserInput{
		Email:               "  TARGET@BM.TEST  ",
		Role:                userhousehold.RoleAdmin,
		HouseholdCurrencyID: f.primaryCurrency.ID,
	})
	if err != nil {
		t.Fatalf("expected success on case-insensitive lookup, got %v", err)
	}
	if uh.UserID != f.targetUser.ID {
		t.Errorf(
			"expected UserID=%d, got %d",
			f.targetUser.ID,
			uh.UserID,
		)
	}
	if uh.Role != userhousehold.RoleAdmin {
		t.Errorf("expected Role=admin, got %q", uh.Role)
	}
}

func TestAddHouseholdUser_InvalidCurrency(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)

	_, err := callAddHouseholdUser(ctx, r, model.AddHouseholdUserInput{
		Email:               f.targetUser.Email,
		Role:                userhousehold.RoleMember,
		HouseholdCurrencyID: f.otherCurrency.ID,
	})
	requireErrorContains(t, err, "invalid household currency")
}

// ---------------------------------------------------------------------------
// RemoveHouseholdUser tests (T29)
// ---------------------------------------------------------------------------

func callRemoveHouseholdUser(
	ctx context.Context,
	r *Resolver,
	id int,
) (*model.RemoveHouseholdUserPayload, error) {
	mr := &mutationResolver{Resolver: r}
	return mr.RemoveHouseholdUser(ctx, id)
}

func TestRemoveHouseholdUser_HappyPath(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)

	payload, err := callRemoveHouseholdUser(ctx, r, f.memberUH.ID)
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if payload == nil {
		t.Fatal("expected non-nil payload")
	}
	if payload.RemovedUserHouseholdID != f.memberUH.ID {
		t.Errorf(
			"expected RemovedUserHouseholdID=%d, got %d",
			f.memberUH.ID,
			payload.RemovedUserHouseholdID,
		)
	}

	bypass := contextkeys.NewPrivacyBypassContext(context.Background())
	exists, err := f.client.UserHousehold.Query().
		Where(userhousehold.IDEQ(f.memberUH.ID)).
		Exist(bypass)
	if err != nil {
		t.Fatalf("unexpected query error: %v", err)
	}
	if exists {
		t.Errorf("expected membership row %d to be deleted", f.memberUH.ID)
	}
}

func TestRemoveHouseholdUser_SelfRemovalBlocked(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)

	_, err := callRemoveHouseholdUser(ctx, r, f.adminUH.ID)
	requireErrorContains(t, err, "SELF_REMOVAL_NOT_ALLOWED")
}

func TestRemoveHouseholdUser_LastAdminProtected(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	bypass := contextkeys.NewPrivacyBypassContext(context.Background())

	// Promote a second user to admin so the caller's isAdmin check and the
	// self-removal guard both pass. In normal CRUD flow the resolver's admin
	// count would be >= 2 here and LAST_ADMIN_PROTECTED could not fire — the
	// branch is defensive code guarding against races where rows vanish
	// between the isAdmin Exist() and the admin count Count() calls. To
	// exercise that branch we install a one-shot interceptor that forces the
	// next UserHousehold.Count(...) result to 1.
	secondAdmin := f.client.User.Create().
		SetEmail("second-admin@bm.test").
		SetName("Second Admin").
		SaveX(bypass)
	secondAdminUH := f.client.UserHousehold.Create().
		SetUserID(secondAdmin.ID).
		SetHouseholdID(f.household.ID).
		SetRole(userhousehold.RoleAdmin).
		SetHouseholdCurrencyID(f.primaryCurrency.ID).
		SaveX(bypass)

	forced := false
	f.client.UserHousehold.Intercept(
		ent.InterceptFunc(func(next ent.Querier) ent.Querier {
			return ent.QuerierFunc(
				func(ctx context.Context, q ent.Query) (ent.Value, error) {
					qc := entcore.QueryFromContext(ctx)
					value, err := next.Query(ctx, q)
					if err != nil {
						return value, err
					}
					if !forced &&
						qc != nil &&
						qc.Op == entcore.OpQueryCount {
						forced = true
						return 1, nil
					}
					return value, err
				},
			)
		}),
	)

	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	_, err := callRemoveHouseholdUser(ctx, r, secondAdminUH.ID)
	requireErrorContains(t, err, "LAST_ADMIN_PROTECTED")
}

func TestRemoveHouseholdUser_OwnedRecordsBlocked(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	bypass := context.WithValue(
		contextkeys.NewPrivacyBypassContext(context.Background()),
		contextkeys.HouseholdIDKey(),
		f.household.ID,
	)

	f.client.Account.Create().
		SetHouseholdID(f.household.ID).
		SetUserID(f.memberUser.ID).
		SetHouseholdCurrencyID(f.primaryCurrency.ID).
		SetName("Member Checking").
		SetType("liquidity").
		SaveX(bypass)

	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	_, err := callRemoveHouseholdUser(ctx, r, f.memberUH.ID)
	requireErrorContains(t, err, "MEMBER_HAS_OWNED_RECORDS")
}

func TestRemoveHouseholdUser_DemoHouseholdBlocked(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	bypass := contextkeys.NewPrivacyBypassContext(context.Background())

	demoMember := f.client.UserHousehold.Create().
		SetUserID(f.memberUser.ID).
		SetHouseholdID(f.demoHousehold.ID).
		SetRole(userhousehold.RoleMember).
		SetHouseholdCurrencyID(f.demoCurrency.ID).
		SaveX(bypass)

	ctx := memberCallCtx(f.client, f.adminUser.ID, f.demoHousehold.ID)
	_, err := callRemoveHouseholdUser(ctx, r, demoMember.ID)
	requireErrorContains(t, err, "MEMBER_MUTATION_LOCKED_ON_DEMO_HOUSEHOLD")
}

func TestRemoveHouseholdUser_Idempotent(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)

	if _, err := callRemoveHouseholdUser(ctx, r, f.memberUH.ID); err != nil {
		t.Fatalf("first removal failed: %v", err)
	}

	payload, err := callRemoveHouseholdUser(ctx, r, f.memberUH.ID)
	if err != nil {
		t.Fatalf("expected idempotent removal, got error: %v", err)
	}
	if payload == nil {
		t.Fatal("expected payload, got nil")
	}
	if payload.RemovedUserHouseholdID != f.memberUH.ID {
		t.Errorf(
			"expected RemovedUserHouseholdID=%d, got %d",
			f.memberUH.ID,
			payload.RemovedUserHouseholdID,
		)
	}
}

// ---------------------------------------------------------------------------
// UpdateHouseholdUserRole tests (T29)
// ---------------------------------------------------------------------------

func callUpdateHouseholdUserRole(
	ctx context.Context,
	r *Resolver,
	id int,
	role userhousehold.Role,
) (*ent.UserHousehold, error) {
	mr := &mutationResolver{Resolver: r}
	return mr.UpdateHouseholdUserRole(ctx, id, role)
}

func TestUpdateHouseholdUserRole_PromoteMember(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)

	updated, err := callUpdateHouseholdUserRole(
		ctx,
		r,
		f.memberUH.ID,
		userhousehold.RoleAdmin,
	)
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if updated == nil {
		t.Fatal("expected updated UserHousehold, got nil")
	}
	if updated.Role != userhousehold.RoleAdmin {
		t.Errorf("expected Role=admin, got %q", updated.Role)
	}
}

func TestUpdateHouseholdUserRole_DemoteAdmin(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	bypass := contextkeys.NewPrivacyBypassContext(context.Background())

	secondAdmin := f.client.User.Create().
		SetEmail("second-admin@bm.test").
		SetName("Second Admin").
		SaveX(bypass)
	secondAdminUH := f.client.UserHousehold.Create().
		SetUserID(secondAdmin.ID).
		SetHouseholdID(f.household.ID).
		SetRole(userhousehold.RoleAdmin).
		SetHouseholdCurrencyID(f.primaryCurrency.ID).
		SaveX(bypass)

	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)
	updated, err := callUpdateHouseholdUserRole(
		ctx,
		r,
		secondAdminUH.ID,
		userhousehold.RoleMember,
	)
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if updated.Role != userhousehold.RoleMember {
		t.Errorf("expected Role=member, got %q", updated.Role)
	}
}

func TestUpdateHouseholdUserRole_LastAdminDemotionBlocked(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)

	_, err := callUpdateHouseholdUserRole(
		ctx,
		r,
		f.adminUH.ID,
		userhousehold.RoleMember,
	)
	requireErrorContains(t, err, "LAST_ADMIN_PROTECTED")
}

func TestUpdateHouseholdUserRole_DemoHouseholdBlocked(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	bypass := contextkeys.NewPrivacyBypassContext(context.Background())

	demoMember := f.client.UserHousehold.Create().
		SetUserID(f.memberUser.ID).
		SetHouseholdID(f.demoHousehold.ID).
		SetRole(userhousehold.RoleMember).
		SetHouseholdCurrencyID(f.demoCurrency.ID).
		SaveX(bypass)

	ctx := memberCallCtx(f.client, f.adminUser.ID, f.demoHousehold.ID)
	_, err := callUpdateHouseholdUserRole(
		ctx,
		r,
		demoMember.ID,
		userhousehold.RoleAdmin,
	)
	requireErrorContains(t, err, "MEMBER_MUTATION_LOCKED_ON_DEMO_HOUSEHOLD")
}

func TestUpdateHouseholdUserRole_NonAdminDenied(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.memberUser.ID, f.household.ID)

	_, err := callUpdateHouseholdUserRole(
		ctx,
		r,
		f.adminUH.ID,
		userhousehold.RoleMember,
	)
	requireErrorContains(t, err, "NOT_HOUSEHOLD_ADMIN")
}

func TestUpdateHouseholdUserRole_NoOp(t *testing.T) {
	f := setupMemberFixture(t)
	r := newMemberTestResolver(f.client)
	ctx := memberCallCtx(f.client, f.adminUser.ID, f.household.ID)

	updated, err := callUpdateHouseholdUserRole(
		ctx,
		r,
		f.memberUH.ID,
		userhousehold.RoleMember,
	)
	if err != nil {
		t.Fatalf("expected nil error for no-op, got %v", err)
	}
	if updated == nil {
		t.Fatal("expected non-nil row")
	}
	if updated.ID != f.memberUH.ID {
		t.Errorf(
			"expected returned ID=%d, got %d",
			f.memberUH.ID,
			updated.ID,
		)
	}
	if updated.Role != userhousehold.RoleMember {
		t.Errorf(
			"expected unchanged Role=member, got %q",
			updated.Role,
		)
	}
}
