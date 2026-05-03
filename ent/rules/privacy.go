package rules

import (
	"context"

	"beavermoney.app/ent"
	"beavermoney.app/ent/household"
	"beavermoney.app/ent/predicate"
	"beavermoney.app/ent/privacy"
	"beavermoney.app/ent/user"
	"beavermoney.app/ent/userhousehold"
	"beavermoney.app/internal/contextkeys"
	"entgo.io/ent/entql"
)

func AllowPrivacyBypass() privacy.QueryMutationRule {
	return privacy.ContextQueryMutationRule(func(ctx context.Context) error {
		if contextkeys.IsPrivacyBypass(ctx) {
			return privacy.Allow
		}
		return privacy.Skip
	})
}

// FilterByHousehold enforces strict isolation per household.
func FilterByHousehold() privacy.QueryMutationRule {
	type HouseholdScoped interface {
		WhereHouseholdID(entql.IntP)
	}

	return privacy.FilterFunc(
		func(ctx context.Context, f privacy.Filter) error {
			hid, ok := ctx.Value(contextkeys.HouseholdIDKey()).(int)
			if !ok || hid == 0 {
				return privacy.Denyf("security: missing household context")
			}

			tf, ok := f.(HouseholdScoped)
			if !ok {
				return privacy.Denyf("cannot apply household filter")
			}

			tf.WhereHouseholdID(entql.IntEQ(hid))

			return privacy.Skip
		},
	)
}

// FilterMe is used by the User schema, such that anyone can only see their own user record.
func FilterMe() privacy.QueryMutationRule {
	type MeFilter interface {
		WhereID(entql.IntP)
	}

	return privacy.FilterFunc(
		func(ctx context.Context, f privacy.Filter) error {
			uid, ok := ctx.Value(contextkeys.UserIDKey()).(int)
			if !ok {
				return privacy.Denyf("unauthenticated filter me")
			}

			tf, ok := f.(MeFilter)
			if !ok {
				return privacy.Denyf("cannot apply me filter")
			}

			tf.WhereID(entql.IntEQ(uid))

			return privacy.Skip
		},
	)
}

// FilterMeOrCoMember allows a user to see their own User record.
// When a household context is set, it also allows seeing other members of that household.
func FilterMeOrCoMember() privacy.QueryMutationRule {
	type CoMemberUserFilter interface {
		WhereHasUserHouseholdsWith(preds ...predicate.UserHousehold)
		WhereID(entql.IntP)
	}

	return privacy.FilterFunc(
		func(ctx context.Context, f privacy.Filter) error {
			uid, ok := ctx.Value(contextkeys.UserIDKey()).(int)
			if !ok {
				return privacy.Denyf("unauthenticated filter me-or-co-member")
			}

			tf, ok := f.(CoMemberUserFilter)
			if !ok {
				return privacy.Denyf("cannot apply me-or-co-member filter")
			}

			hid, hasHousehold := ctx.Value(contextkeys.HouseholdIDKey()).(int)
			if hasHousehold && hid > 0 {
				// Allow all users who are members of the active household.
				// This includes the current user because they are also a member.
				tf.WhereHasUserHouseholdsWith(userhousehold.HouseholdIDEQ(hid))
			} else {
				tf.WhereID(entql.IntEQ(uid))
			}

			return privacy.Skip
		},
	)
}

// FilterOwner is used by the UserKey schema, such that anyone can only see their own user keys.
func FilterOwner() privacy.QueryMutationRule {
	type OwnerFilter interface {
		WhereHasUserWith(func(*ent.UserFilter))
	}

	return privacy.FilterFunc(
		func(ctx context.Context, f privacy.Filter) error {
			uid, ok := ctx.Value(contextkeys.UserIDKey()).(int)
			if !ok {
				return privacy.Denyf("unauthenticated filter owner")
			}

			tf, ok := f.(OwnerFilter)
			if !ok {
				return privacy.Denyf("cannot apply owner filter")
			}

			tf.WhereHasUserWith(func(uf *ent.UserFilter) {
				uf.WhereID(entql.IntEQ(uid))
			})

			return privacy.Skip
		},
	)
}

// FilterMemberHousehold is used by the UserHousehold schema, such that anyone can only see households they are a member of.
func FilterMemberHousehold() privacy.QueryMutationRule {
	type MemberHouseholdFilter interface {
		WhereHasUsersWith(preds ...predicate.User)
	}

	return privacy.FilterFunc(
		func(ctx context.Context, f privacy.Filter) error {
			uid, ok := ctx.Value(contextkeys.UserIDKey()).(int)
			if !ok {
				return privacy.Denyf("unauthenticated member household")
			}

			tf, ok := f.(MemberHouseholdFilter)
			if !ok {
				return privacy.Denyf("cannot apply household membership filter")
			}

			// Apply filter
			tf.WhereHasUsersWith(user.IDEQ(uid))

			return privacy.Skip
		},
	)
}

// FilterAdminHousehold restricts household mutations to users with the admin role.
func FilterAdminHousehold() privacy.QueryMutationRule {
	type AdminHouseholdFilter interface {
		WhereHasUserHouseholdsWith(preds ...predicate.UserHousehold)
	}

	return privacy.FilterFunc(
		func(ctx context.Context, f privacy.Filter) error {
			uid, ok := ctx.Value(contextkeys.UserIDKey()).(int)
			if !ok {
				return privacy.Denyf("unauthenticated admin household")
			}

			tf, ok := f.(AdminHouseholdFilter)
			if !ok {
				return privacy.Denyf("cannot apply admin household filter")
			}

			tf.WhereHasUserHouseholdsWith(
				userhousehold.UserIDEQ(uid),
				userhousehold.RoleEQ(userhousehold.RoleAdmin),
			)

			return privacy.Skip
		},
	)
}

// FilterAdminOfTargetHousehold restricts UserHousehold mutations to admins of the target household.
// Unlike FilterAdminHousehold (which filters Household rows), this rule operates on UserHousehold
// rows and checks that the caller is admin of the same household_id as the row being mutated.
func FilterAdminOfTargetHousehold() privacy.QueryMutationRule {
	type AdminOfHouseholdFilter interface {
		WhereHasHouseholdWith(preds ...predicate.Household)
	}

	return privacy.FilterFunc(
		func(ctx context.Context, f privacy.Filter) error {
			uid, ok := ctx.Value(contextkeys.UserIDKey()).(int)
			if !ok {
				return privacy.Denyf("unauthenticated admin of target household")
			}

			tf, ok := f.(AdminOfHouseholdFilter)
			if !ok {
				return privacy.Denyf("cannot apply admin of target household filter")
			}

			tf.WhereHasHouseholdWith(
				household.HasUserHouseholdsWith(
					userhousehold.UserIDEQ(uid),
					userhousehold.RoleEQ(userhousehold.RoleAdmin),
				),
			)

			return privacy.Skip
		},
	)
}

// BlockDemoHouseholdMutation prevents member management mutations on demo households.
func BlockDemoHouseholdMutation() privacy.QueryMutationRule {
	type DemoHouseholdFilter interface {
		WhereHasHouseholdWith(preds ...predicate.Household)
	}

	return privacy.FilterFunc(
		func(ctx context.Context, f privacy.Filter) error {
			if contextkeys.IsPrivacyBypass(ctx) {
				return privacy.Skip
			}

			tf, ok := f.(DemoHouseholdFilter)
			if !ok {
				return privacy.Denyf("cannot apply demo household mutation block")
			}

			tf.WhereHasHouseholdWith(household.IsDemoEQ(false))

			return privacy.Skip
		},
	)
}


