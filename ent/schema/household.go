package schema

import (
	"beavermoney.app/ent/privacy"
	"beavermoney.app/ent/rules"
	beavermoney_mixin "beavermoney.app/ent/schema/mixin"
	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"entgo.io/ent/schema/mixin"
	"github.com/shopspring/decimal"
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
		field.String("currency_code").NotEmpty(),
		field.Int("legacy_currency_id").
			StorageKey("currency_id").
			Optional().
			Nillable().
			Annotations(entgql.Skip(entgql.SkipAll)),
		field.Bool("is_demo").Default(false).Immutable(),
	}
}

// Edges of the Household.
func (Household) Edges() []ent.Edge {
	return []ent.Edge{
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
		edge.To("household_currencies", HouseholdCurrency.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
				entsql.OnDelete(entsql.Cascade),
			),
		edge.To("household_rates", HouseholdRate.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
				entsql.OnDelete(entsql.Cascade),
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

type HouseholdCurrency struct {
	ent.Schema
}

func (HouseholdCurrency) Fields() []ent.Field {
	return []ent.Field{
		field.String("code").NotEmpty().Immutable(),
		field.Bool("important").Default(false),
		field.Int("legacy_currency_id").
			StorageKey("currency_id").
			Optional().
			Nillable().
			Annotations(entgql.Skip(entgql.SkipAll)),
	}
}

func (HouseholdCurrency) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Field("household_id").
			Ref("household_currencies").
			Unique().
			Immutable().
			Required().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		edge.To("accounts", Account.Type),
		edge.To("investments", Investment.Type),
		edge.To("transaction_entries", TransactionEntry.Type),
		edge.To("recurring_subscriptions", RecurringSubscription.Type),
		edge.To("snapshot_entries", SnapshotEntry.Type),
		edge.To("snapshot_rates_from", SnapshotRate.Type),
		edge.To("snapshot_rates_to", SnapshotRate.Type),
		edge.To("household_rates_from", HouseholdRate.Type),
		edge.To("household_rates_to", HouseholdRate.Type),
	}
}

func (HouseholdCurrency) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("household_id", "code").Unique(),
	}
}

func (HouseholdCurrency) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.RelayConnection(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}

func (HouseholdCurrency) Mixin() []ent.Mixin {
	return []ent.Mixin{
		beavermoney_mixin.HouseholdMixin{},
		mixin.AnnotateFields(mixin.Time{},
			entgql.Skip(
				entgql.SkipMutationCreateInput,
				entgql.SkipMutationUpdateInput,
			),
		),
	}
}

type HouseholdRate struct {
	ent.Schema
}

func (HouseholdRate) Fields() []ent.Field {
	return []ent.Field{
		field.Float("rate").GoType(decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(36,18)",
			}).
			Annotations(
				entgql.Type("String"),
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),

		field.Int("from_household_currency_id").Positive().Immutable().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		field.Int("legacy_from_currency_id").
			StorageKey("from_currency_id").
			Optional().
			Nillable().
			Annotations(entgql.Skip(entgql.SkipAll)),

		field.Int("to_household_currency_id").Positive().Immutable().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		field.Int("legacy_to_currency_id").
			StorageKey("to_currency_id").
			Optional().
			Nillable().
			Annotations(entgql.Skip(entgql.SkipAll)),
	}
}

func (HouseholdRate) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Field("household_id").
			Ref("household_rates").
			Unique().
			Immutable().
			Required().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		edge.From("from_currency", HouseholdCurrency.Type).
			Field("from_household_currency_id").
			Ref("household_rates_from").
			Unique().
			Immutable().
			Required().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		edge.From("to_currency", HouseholdCurrency.Type).
			Field("to_household_currency_id").
			Ref("household_rates_to").
			Unique().
			Immutable().
			Required().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
	}
}

func (HouseholdRate) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("household_id", "from_household_currency_id", "to_household_currency_id").Unique(),
	}
}

func (HouseholdRate) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.RelayConnection(),
	}
}

func (HouseholdRate) Mixin() []ent.Mixin {
	return []ent.Mixin{
		beavermoney_mixin.HouseholdMixin{},
		mixin.AnnotateFields(mixin.Time{},
			entgql.Skip(
				entgql.SkipMutationCreateInput,
				entgql.SkipMutationUpdateInput,
			),
		),
	}
}
