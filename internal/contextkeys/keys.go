package contextkeys

import "context"

type (
	householdIDKey   struct{}
	userIDKey        struct{}
	privacyBypassKey struct{}
)

func HouseholdIDKey() any {
	return householdIDKey{}
}

func UserIDKey() any {
	return userIDKey{}
}

func PrivacyBypassKey() any {
	return privacyBypassKey{}
}

func NewPrivacyBypassContext(parent context.Context) context.Context {
	return context.WithValue(parent, privacyBypassKey{}, true)
}

func IsPrivacyBypass(ctx context.Context) bool {
	isPrivacyBypass, ok := ctx.Value(privacyBypassKey{}).(bool)
	return ok && isPrivacyBypass
}

func GetHouseholdID(ctx context.Context) int {
	v := ctx.Value(householdIDKey{})

	id, ok := v.(int)
	if !ok {
		panic("household ID not found in context")
	}

	return id
}

func GetUserID(ctx context.Context) int {
	v := ctx.Value(userIDKey{})

	id, ok := v.(int)
	if !ok {
		panic("user ID not found in context")
	}

	return id
}
