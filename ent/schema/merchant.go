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
	"fmt"
	"unicode/utf8"
)

type Merchant struct{ ent.Schema }

func (Merchant) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty().SchemaType(map[string]string{dialect.Postgres: "varchar(120)"}).Validate(func(v string) error {
			if utf8.RuneCountInString(v) > 120 {
				return fmt.Errorf("merchant name exceeds 120 characters")
			}
			return nil
		}),
		field.String("name_key").NotEmpty().MaxLen(512).Annotations(entgql.Skip()),
		field.String("icon").Optional().Nillable().MaxLen(253),
	}
}
func (Merchant) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("household", Household.Type).Ref("merchants").Field("household_id").Unique().Required().Immutable(),
		edge.To("transactions", Transaction.Type).Annotations(entgql.RelayConnection(), entsql.OnDelete(entsql.Restrict)),
	}
}
func (Merchant) Indexes() []ent.Index {
	return []ent.Index{index.Fields("household_id", "name_key").Unique()}
}
func (Merchant) Mixin() []ent.Mixin {
	return []ent.Mixin{mixin.Time{}, householdmixin.HouseholdMixin{}}
}
func (Merchant) Annotations() []schema.Annotation {
	return []schema.Annotation{entgql.QueryField(), entgql.RelayConnection()}
}
