package schema

import (
	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/field"
)

// Currency is a legacy entity kept for data migration only.
// Phase 2 cleanup will delete this schema and drop the currencies table.
type Currency struct {
	ent.Schema
}

func (Currency) Fields() []ent.Field {
	return []ent.Field{
		field.String("code").NotEmpty().Unique(),
		field.Strings("locales"),
	}
}

func (Currency) Edges() []ent.Edge {
	return nil
}

func (Currency) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.Skip(entgql.SkipAll),
	}
}
