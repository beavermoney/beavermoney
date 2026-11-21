package schema

import (
	householdmixin "beavermoney.app/ent/schema/mixin"
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

// Observations are shared versions, not children of a journal entry. A later
// snapshot can still reference a version after the entry that first recorded it
// is deleted. create_time is explicitly shared with the capture stamp.
type SnapshotAccount struct{ ent.Schema }

func (SnapshotAccount) Fields() []ent.Field {
	return []ent.Field{
		field.Int("account_id").Immutable(),
		field.Float("balance").GoType(decimal.Decimal{}).SchemaType(map[string]string{dialect.Postgres: "numeric(36,18)"}).Immutable(),
		field.Bool("archived").Immutable(),
	}
}
func (SnapshotAccount) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).Ref("snapshot_accounts").Field("household_id").Unique().Required().Immutable(),
		edge.From("account", Account.Type).Ref("snapshot_accounts").Field("account_id").Unique().Required().Immutable(),
	}
}
func (SnapshotAccount) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("household_id", "account_id", "create_time").Unique().Annotations(entsql.DescColumns("create_time")),
	}
}
func (SnapshotAccount) Mixin() []ent.Mixin {
	return []ent.Mixin{mixin.CreateTime{}, householdmixin.HouseholdMixin{}}
}
func (SnapshotAccount) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.Skip(),
		entsql.Checks(map[string]string{"snapshot_account_archived_empty": "NOT archived OR balance = 0"}),
	}
}

type SnapshotInvestment struct{ ent.Schema }

func (SnapshotInvestment) Fields() []ent.Field {
	return []ent.Field{
		field.Int("investment_id").Immutable(),
		field.Float("quantity").GoType(decimal.Decimal{}).SchemaType(map[string]string{dialect.Postgres: "numeric(36,18)"}).Immutable(),
		field.Float("average_cost").GoType(decimal.Decimal{}).SchemaType(map[string]string{dialect.Postgres: "numeric(36,18)"}).Optional().Nillable().Immutable(),
		field.Float("market_price").GoType(decimal.Decimal{}).SchemaType(map[string]string{dialect.Postgres: "numeric(36,18)"}).Immutable(),
		field.Time("average_confirmed_at").Optional().Nillable().Immutable(),
		field.Bool("needs_review").Immutable(),
		field.Bool("archived").Immutable(),
	}
}
func (SnapshotInvestment) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).Ref("snapshot_investments").Field("household_id").Unique().Required().Immutable(),
		edge.From("investment", Investment.Type).Ref("snapshot_investments").Field("investment_id").Unique().Required().Immutable(),
	}
}
func (SnapshotInvestment) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("household_id", "investment_id", "create_time").Unique().Annotations(entsql.DescColumns("create_time")),
	}
}
func (SnapshotInvestment) Mixin() []ent.Mixin {
	return []ent.Mixin{mixin.CreateTime{}, householdmixin.HouseholdMixin{}}
}
func (SnapshotInvestment) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.Skip(),
		entsql.Checks(map[string]string{
			"snapshot_investment_average_nonnegative": "average_cost IS NULL OR average_cost >= 0",
			"snapshot_investment_archived_empty":      "NOT archived OR quantity = 0",
		}),
	}
}
