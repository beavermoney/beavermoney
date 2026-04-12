package mixin

import (
	"beavermoney.app/ent/privacy"
	"beavermoney.app/ent/rules"
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
)

type HouseholdMixin struct {
	mixin.Schema
}

func (HouseholdMixin) Fields() []ent.Field {
	return []ent.Field{
		field.Int("household_id").Immutable(),
	}
}

func (HouseholdMixin) Policy() ent.Policy {
	return privacy.Policy{
		Query: privacy.QueryPolicy{
			rules.FilterByHousehold(),
		},
		Mutation: privacy.MutationPolicy{
			rules.FilterByHousehold(),
		},
	}
}
