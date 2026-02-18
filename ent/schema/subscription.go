package schema

import (
	beavermoney_mixin "beavermoney.app/ent/schema/mixin"
	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
	"github.com/shopspring/decimal"
)

// RecurringSubscription holds the schema definition for the RecurringSubscription entity.
type RecurringSubscription struct {
	ent.Schema
}

// Fields of the RecurringSubscription.
func (RecurringSubscription) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty(),

		field.Enum("interval").
			Values("week", "month", "year"),
		field.Int("interval_count").Positive().Default(1),

		field.Time("start_date").SchemaType(map[string]string{
			dialect.Postgres: "date",
		}),

		field.Bool("active").Default(true),

		field.String("icon").Optional(),

		field.Float("cost").GoType(decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(36,18)",
			}).
			Annotations(
				entgql.Type("String"),
			).
			DefaultFunc(func() decimal.Decimal {
				return decimal.NewFromInt(0)
			}),

		field.Float("fx_rate").GoType(decimal.Decimal{}).
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
		field.Int("currency_id").Positive().Immutable(),
		field.Int("user_id").Positive().Immutable(),
	}
}

// Edges of the RecurringSubscription.
func (RecurringSubscription) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Field("household_id").
			Ref("recurring_subscriptions").
			Unique().
			Immutable().
			Required().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		edge.From("currency", Currency.Type).
			Field("currency_id").
			Ref("recurring_subscriptions").
			Unique().
			Immutable().
			Required(),
		edge.From("user", User.Type).
			Ref("recurring_subscriptions").
			Field("user_id").
			Unique().
			Required().
			Immutable().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
	}
}

func (RecurringSubscription) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.RelayConnection(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}

func (RecurringSubscription) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.AnnotateFields(mixin.Time{},
			entgql.Skip(
				entgql.SkipMutationCreateInput,
				entgql.SkipMutationUpdateInput,
			),
		),
		beavermoney_mixin.HouseholdMixin{},
	}
}
