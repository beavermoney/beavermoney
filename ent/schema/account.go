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

// Account holds the schema definition for the Account entity.
type Account struct {
	ent.Schema
}

// Fields of the Account.
func (Account) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty(),
		field.Enum("type").
			Values("liquidity", "investment", "property", "receivable", "liability").
			Immutable(),

		field.Float("balance").GoType(decimal.Decimal{}).
			Comment("Balance is only the cash portion of the account excluding investments").
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(36,18)",
			}).
			Annotations(
				entgql.Type("String"),
				entgql.Skip(
					entgql.SkipMutationUpdateInput,
				),
			).
			Immutable().
			DefaultFunc(func() decimal.Decimal {
				return decimal.NewFromInt(0)
			}),

		field.String("icon").Optional(),

		field.Float("value").GoType(decimal.Decimal{}).
			Comment("Value is the total value of the account including investments").
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
			Immutable().
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

// Edges of the Account.
func (Account) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Field("household_id").
			Ref("accounts").
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
			Ref("accounts").
			Unique().
			Immutable().
			Required(),
		edge.From("user", User.Type).
			Ref("accounts").
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

		edge.To("transaction_entries", TransactionEntry.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		edge.To("investments", Investment.Type).
			Annotations(

				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
	}
}

func (Account) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.RelayConnection(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}

func (Account) Mixin() []ent.Mixin {
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
