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

// Snapshot holds the schema definition for the Snapshot entity.
type Snapshot struct {
	ent.Schema
}

// Fields of the Snapshot.
func (Snapshot) Fields() []ent.Field {
	return []ent.Field{
		field.Text("note").
			Optional().
			Comment("Optional user note for this Snapshot"),
	}
}

// Edges of the Snapshot.
func (Snapshot) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Field("household_id").
			Ref("snapshots").
			Unique().
			Immutable().
			Required().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		edge.To("snapshot_entries", SnapshotEntry.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
				entsql.OnDelete(entsql.Cascade),
			),
		edge.To("snapshot_rates", SnapshotRate.Type).
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
				entsql.OnDelete(entsql.Cascade),
			),
	}
}

// Indexes of the Snapshot.
func (Snapshot) Indexes() []ent.Index {
	return []ent.Index{
		// Index for querying Snapshots by household and creation time
		index.Fields("household_id", "create_time"),
	}
}

func (Snapshot) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.RelayConnection(),
		entgql.Mutations(entgql.MutationCreate(), entgql.MutationUpdate()),
	}
}

func (Snapshot) Mixin() []ent.Mixin {
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

// SnapshotEntry holds the schema definition for the SnapshotEntry entity.
type SnapshotEntry struct {
	ent.Schema
}

// Fields of the SnapshotEntry.
func (SnapshotEntry) Fields() []ent.Field {
	return []ent.Field{
		field.Float("liquidity").GoType(decimal.Decimal{}).
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
			Comment("Total liquidity account values"),

		field.Float("investment").GoType(decimal.Decimal{}).
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
			Comment("Total investment account values"),

		field.Float("property").GoType(decimal.Decimal{}).
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
			Comment("Total property account values"),

		field.Float("receivable").GoType(decimal.Decimal{}).
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
			Comment("Total receivable account values"),

		field.Float("liability").GoType(decimal.Decimal{}).
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
			Comment("Total liability account values (negative)"),

		field.Int("household_currency_id").Positive().Immutable().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),

		field.Int("user_id").Positive().Immutable().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),

		field.Int("snapshot_id").Positive().Immutable().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
	}
}

// Edges of the SnapshotEntry.
func (SnapshotEntry) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).
			Field("household_id").
			Ref("snapshot_entries").
			Unique().
			Immutable().
			Required().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		edge.From("household_currency", HouseholdCurrency.Type).
			Field("household_currency_id").
			Ref("snapshot_entries").
			Unique().
			Immutable().
			Required().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
		edge.From("user", User.Type).
			Field("user_id").
			Ref("snapshot_entries").
			Unique().
			Immutable().
			Required().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),

		edge.From("snapshot", Snapshot.Type).
			Field("snapshot_id").
			Ref("snapshot_entries").
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

// Indexes of the SnapshotEntry.
func (SnapshotEntry) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("snapshot_id"),
		index.Fields("snapshot_id", "user_id", "household_currency_id").Unique(),
	}
}

func (SnapshotEntry) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.RelayConnection(),
	}
}

func (SnapshotEntry) Mixin() []ent.Mixin {
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

type SnapshotRate struct {
	ent.Schema
}

func (SnapshotRate) Fields() []ent.Field {
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
			).
			Immutable(),

		field.Int("snapshot_id").Positive().Immutable().
			Annotations(
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

		field.Int("to_household_currency_id").Positive().Immutable().
			Annotations(
				entgql.Skip(
					entgql.SkipMutationCreateInput,
					entgql.SkipMutationUpdateInput,
				),
			),
	}
}

func (SnapshotRate) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("snapshot", Snapshot.Type).
			Field("snapshot_id").
			Ref("snapshot_rates").
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
			Ref("snapshot_rates_from").
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
			Ref("snapshot_rates_to").
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

func (SnapshotRate) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("snapshot_id"),
		index.Fields("snapshot_id", "from_household_currency_id", "to_household_currency_id").
			Unique(),
	}
}

func (SnapshotRate) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.RelayConnection(),
	}
}

func (SnapshotRate) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.AnnotateFields(mixin.Time{},
			entgql.Skip(
				entgql.SkipMutationCreateInput,
				entgql.SkipMutationUpdateInput,
			),
		),
	}
}
