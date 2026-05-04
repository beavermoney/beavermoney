package schema

import (
	"beavermoney.app/ent/privacy"
	"beavermoney.app/ent/rules"
	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"entgo.io/ent/schema/mixin"
)

// User holds the schema definition for the User entity.
type User struct {
	ent.Schema
}

// Fields of the User.
//
// Email is nullable because synthetic joint users (is_synthetic=true) have
// no email and no UserKey. Real users must have a non-empty unique email;
// that invariant is enforced at the resolver layer.
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("email").Optional().Nillable().Unique(),
		field.String("name").NotEmpty(),
		field.Bool("is_synthetic").Default(false).Immutable(),
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("households", Household.Type).
			Through("user_households", UserHousehold.Type),
		edge.To("accounts", Account.Type),
		edge.To("investments", Investment.Type),
		edge.To("transactions", Transaction.Type),
		edge.To("user_keys", UserKey.Type),
		edge.To("recurring_subscriptions", RecurringSubscription.Type),
		edge.To("snapshot_entries", SnapshotEntry.Type),
	}
}

func (User) Annotations() []schema.Annotation {
	return []schema.Annotation{}
}

func (User) Policy() ent.Policy {
	return privacy.Policy{
		Query: privacy.QueryPolicy{
			rules.AllowPrivacyBypass(),
			rules.FilterMeOrCoMember(),
		},
		Mutation: privacy.MutationPolicy{
			rules.AllowPrivacyBypass(),
			privacy.OnMutationOperation(
				privacy.AlwaysAllowRule(),
				ent.OpCreate,
			),
			rules.FilterMe(),
		},
	}
}

func (User) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.Time{},
	}
}

// UserKey holds the schema definition for the UserKey entity.
type UserKey struct {
	ent.Schema
}

// Fields of the UserKey.
func (UserKey) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("provider").Values("google"),
		field.String("key").NotEmpty(),
		field.Int("user_id").Positive().Immutable(),
	}
}

func (UserKey) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("provider", "key").Unique(),
	}
}

// Edges of the UserKey.
func (UserKey) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Field("user_id").
			Ref("user_keys").
			Unique().
			Immutable().
			Required(),
	}
}

func (UserKey) Annotations() []schema.Annotation {
	return []schema.Annotation{}
}

func (UserKey) Policy() ent.Policy {
	return privacy.Policy{
		Query: privacy.QueryPolicy{
			rules.AllowPrivacyBypass(),
			rules.FilterOwner(),
		},
		Mutation: privacy.MutationPolicy{
			privacy.OnMutationOperation(
				privacy.AlwaysAllowRule(),
				ent.OpCreate,
			),
			rules.FilterOwner(),
		},
	}
}

func (UserKey) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.Time{},
	}
}

// UserHousehold holds the schema definition for the UserHousehold entity.
type UserHousehold struct {
	ent.Schema
}

// Fields of the UserHousehold.
func (UserHousehold) Fields() []ent.Field {
	return []ent.Field{
		field.Int("user_id").Immutable(),
		field.Int("household_id").Immutable(),
		field.Enum("role").
			Values("admin", "member"),
		field.Int("household_currency_id"),
	}
}

// Edges of the UserHousehold.
func (UserHousehold) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("user", User.Type).
			Unique().
			Required().
			Field("user_id").
			Immutable(),
		edge.To("household", Household.Type).
			Unique().
			Required().
			Field("household_id").Immutable(),
		edge.To("household_currency", HouseholdCurrency.Type).
			Unique().
			Required().
			Field("household_currency_id"),
	}
}

func (UserHousehold) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
	}
}

// Indexes of the UserHousehold.
func (UserHousehold) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("user_id", "household_id").Unique(),
	}
}

func (UserHousehold) Policy() ent.Policy {
	return privacy.Policy{
		Query: privacy.QueryPolicy{
			rules.AllowPrivacyBypass(),
			rules.FilterByHousehold(),
		}, Mutation: privacy.MutationPolicy{
			rules.AllowPrivacyBypass(),
			rules.BlockDemoHouseholdMutation(),
			rules.FilterAdminOfTargetHousehold(),
		},
	}
}

func (UserHousehold) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.Time{},
	}
}
