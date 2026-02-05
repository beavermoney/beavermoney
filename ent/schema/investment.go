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

// Investment holds the schema definition for the Investment entity.
type Investment struct {
	ent.Schema
}

// Fields of the Investment.
func (Investment) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.Enum("type").Values("stock", "crypto"),
		field.String("symbol").NotEmpty(),

		field.Float("amount").GoType(decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(36,18)",
			}).
			Annotations(entgql.Type("String")).
			DefaultFunc(func() decimal.Decimal {
				return decimal.NewFromInt(0)
			}),

		field.Float("quote").GoType(decimal.Decimal{}).
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
		field.Float("value").GoType(decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(36,18)",
			}).
			Annotations(
				entgql.Type("String"),
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			).
			DefaultFunc(func() decimal.Decimal {
				return decimal.NewFromInt(0)
			}),

		field.Int("account_id").Positive().Immutable(),
		field.Int("currency_id").Positive().Immutable(),
	}
}

// Edges of the Investment.
func (Investment) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("account", Account.Type).
			Field("account_id").
			Ref("investments").
			Unique().Immutable().Required(),
		edge.From("household", Household.Type).
			Ref("investments").
			Field("household_id").
			Unique().
			Immutable().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			).
			Required(),
		edge.From("currency", Currency.Type).
			Ref("investments").
			Field("currency_id").
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			).
			Unique().
			Immutable().
			Required(),

		edge.To("investment_lots", InvestmentLot.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
	}
}

func (Investment) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.RelayConnection(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}

func (Investment) Mixin() []ent.Mixin {
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

// InvestmentLot holds the schema definition for the Lot entity.
type InvestmentLot struct {
	ent.Schema
}

// Fields of the InvestmentLot.
func (InvestmentLot) Fields() []ent.Field {
	return []ent.Field{
		field.Float("amount").GoType(decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(36,18)",
			}).
			Annotations(entgql.Type("String")),

		field.Float("price").GoType(decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(36,18)",
			}).
			Annotations(entgql.Type("String")),

		field.Int("investment_id").Positive().Immutable(),
		field.Int("transaction_id").Positive().Immutable(),
	}
}

// Edges of the InvestmentLot.
func (InvestmentLot) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Ref("investment_lots").
			Field("household_id").
			Unique().
			Immutable().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			).
			Required(),
		edge.From("investment", Investment.Type).
			Ref("investment_lots").
			Field("investment_id").
			Unique().
			Immutable().
			Required(),
		edge.From("transaction", Transaction.Type).
			Ref("investment_lots").
			Field("transaction_id").
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

func (InvestmentLot) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.RelayConnection(),
		entgql.QueryField(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}

func (InvestmentLot) Mixin() []ent.Mixin {
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
