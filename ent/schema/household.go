package schema

import (
	"beavermoney.app/ent/privacy"
	"beavermoney.app/ent/rules"
	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
)

// Household holds the schema definition for the Household entity.
type Household struct {
	ent.Schema
}

// Fields of the Household.
func (Household) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty(),
		field.String("locale").NotEmpty(),
		field.Int("currency_id").Positive(),
		field.Bool("is_demo").Default(false).Immutable(),
	}
}

// Edges of the Household.
func (Household) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("currency", Currency.Type).
			Ref("households").
			Field("currency_id").
			Unique().
			Required(),
		edge.From("users", User.Type).
			Ref("households").
			Through("user_households", UserHousehold.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),

		edge.To("accounts", Account.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
				entgql.RelayConnection(),
			),
		edge.To("transactions", Transaction.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
				entgql.RelayConnection(),
			),
		edge.To("investments", Investment.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
				entgql.RelayConnection(),
			),
		edge.To("investment_lots", InvestmentLot.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
				entgql.RelayConnection(),
			),
		edge.To("transaction_categories", TransactionCategory.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
				entgql.RelayConnection(),
			),
		edge.To("transaction_entries", TransactionEntry.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
				entgql.RelayConnection(),
			),
		edge.To("recurring_subscriptions", RecurringSubscription.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
				entgql.RelayConnection(),
			),
		edge.To("snapshots", Snapshot.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
				entgql.RelayConnection(),
			),

		edge.To("snapshot_entries", SnapshotEntry.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
				entgql.RelayConnection(),
			),
	}
}

func (Household) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}

func (Household) Policy() ent.Policy {
	return privacy.Policy{
		Query: privacy.QueryPolicy{
			rules.AllowPrivacyBypass(),
			rules.FilterMemberHousehold(),
		},
		Mutation: privacy.MutationPolicy{
			rules.AllowPrivacyBypass(),
			privacy.OnMutationOperation(
				privacy.AlwaysAllowRule(),
				ent.OpCreate,
			),
			rules.FilterAdminHousehold(),
		},
	}
}

func (Household) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.AnnotateFields(mixin.Time{},
			entgql.Skip(
				entgql.SkipMutationCreateInput,
				entgql.SkipMutationUpdateInput,
			),
		),
	}
}
