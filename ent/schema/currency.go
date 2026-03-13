package schema

import (
	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Currency holds the schema definition for the Currency entity.
type Currency struct {
	ent.Schema
}

// Fields of the Currency.
func (Currency) Fields() []ent.Field {
	return []ent.Field{
		field.String("code").NotEmpty().Unique(),
		field.Strings("locales"),
	}
}

// Edges of the Currency.
func (Currency) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("accounts", Account.Type),
		edge.To("investments", Investment.Type),
		edge.To("transaction_entries", TransactionEntry.Type),
		edge.To("households", Household.Type),
		edge.To("recurring_subscriptions", RecurringSubscription.Type),
		edge.To("checkpoints", Checkpoint.Type),
	}
}

func (Currency) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
	}
}
