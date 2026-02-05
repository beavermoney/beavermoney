package schema

import (
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

// Transaction holds the schema definition for the Transaction entity.
type Transaction struct {
	ent.Schema
}

// Fields of the Transaction.
func (Transaction) Fields() []ent.Field {
	return []ent.Field{
		field.String("description").Optional(),
		field.Time("datetime").
			Annotations(
				entgql.OrderField("DATETIME"),
			),

		field.Int("user_id").Positive(),
		field.Int("category_id").Positive(),
	}
}

// Edges of the Transaction.
func (Transaction) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Field("user_id").
			Ref("transactions").
			Unique().
			Required().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		edge.From("household", Household.Type).
			Field("household_id").
			Ref("transactions").
			Unique().
			Immutable().
			Required().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		edge.From("category", TransactionCategory.Type).
			Field("category_id").
			Ref("transactions").
			Unique().
			Required(),

		edge.To("transaction_entries", TransactionEntry.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
				),
				entsql.OnDelete(entsql.Cascade),
			),
		edge.To("investment_lots", InvestmentLot.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
				),
				entsql.OnDelete(entsql.Cascade),
			),
	}
}

func (Transaction) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("datetime"),
	}
}

func (Transaction) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.RelayConnection(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
		entgql.QueryField(),
	}
}

func (Transaction) Mixin() []ent.Mixin {
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

// TransactionCategory holds the schema definition for the TransactionCategory entity.
type TransactionCategory struct {
	ent.Schema
}

// Fields of the TransactionCategory.
func (TransactionCategory) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty(),
		field.Enum("type").
			Values("expense", "income", "transfer", "investment", "setup"),

		field.String("icon"),

		field.Bool("is_immutable").Default(false).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
				),
			),
	}
}

// Edges of the TransactionCategory.
func (TransactionCategory) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Ref("transaction_categories").
			Field("household_id").
			Unique().
			Immutable().
			Required().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
				),
			),
		edge.To("transactions", Transaction.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
				),
			),
	}
}

func (TransactionCategory) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("name", "household_id").Unique(),
	}
}

func (TransactionCategory) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.RelayConnection(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
		entgql.QueryField(),
	}
}

func (TransactionCategory) Mixin() []ent.Mixin {
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

// TransactionEntry holds the schema definition for the TransactionEntry entity.
type TransactionEntry struct {
	ent.Schema
}

// Fields of the TransactionEntry.
func (TransactionEntry) Fields() []ent.Field {
	return []ent.Field{
		field.Float("amount").GoType(decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(36,18)",
			}).
			Annotations(entgql.Type("String")),

		field.Int("account_id").Positive(),
		field.Int("currency_id").Positive().Immutable(),
		field.Int("transaction_id").Positive().Immutable(),
	}
}

// Edges of the TransactionEntry.
func (TransactionEntry) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Ref("transaction_entries").
			Field("household_id").
			Unique().
			Immutable().
			Required().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		edge.From("account", Account.Type).
			Field("account_id").
			Ref("transaction_entries").
			Unique().
			Required(),
		edge.From("currency", Currency.Type).
			Field("currency_id").
			Ref("transaction_entries").
			Unique().
			Required().
			Immutable().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		edge.From("transaction", Transaction.Type).
			Field("transaction_id").
			Ref("transaction_entries").
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

func (TransactionEntry) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
		entgql.QueryField(),
	}
}

func (TransactionEntry) Mixin() []ent.Mixin {
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
