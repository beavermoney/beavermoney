package auth

import (
	"context"
	"net/http"
	"strconv"

	"beavermoney.app/ent"
	"beavermoney.app/ent/householdcurrency"
	"beavermoney.app/ent/userhousehold"
	"beavermoney.app/internal/contextkeys"
	"github.com/go-chi/jwtauth/v5"
)

func Middleware(client *ent.Client) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()

			_, claims, err := jwtauth.FromContext(ctx)
			if err != nil {
				http.Error(w, "Unauthorized: Invalid token", http.StatusUnauthorized)
				return
			}

			userIDStr, ok := claims["user_id"].(string)
			if !ok {
				http.Error(w, "Unauthorized: Invalid user ID", http.StatusUnauthorized)
				return
			}
			userID, err := strconv.Atoi(userIDStr)
			if err != nil {
				http.Error(w, "Bad Request: Invalid user ID format", http.StatusBadRequest)
				return
			}

			ctx = context.WithValue(ctx, contextkeys.UserIDKey(), userID)

			householdIDStr := r.Header.Get("X-Household-ID")
			if householdIDStr != "" {
				hid, err := strconv.Atoi(householdIDStr)
				if err != nil {
					http.Error(w, "Bad Request: Invalid Household ID", http.StatusBadRequest)
					return
				}

				bypassCtx := contextkeys.NewPrivacyBypassContext(ctx)
				bypassCtx = context.WithValue(bypassCtx, contextkeys.HouseholdIDKey(), hid)

				uh, err := client.UserHousehold.Query().
					Where(
						userhousehold.UserID(userID),
						userhousehold.HouseholdID(hid),
					).
					WithDefaultCurrency().
					Only(bypassCtx)
				if err != nil {
					if ent.IsNotFound(err) {
						next.ServeHTTP(w, r.WithContext(ctx))
						return
					}
					http.Error(w, "Internal Server Error", http.StatusInternalServerError)
					return
				}

				ctx = context.WithValue(ctx, contextkeys.HouseholdIDKey(), hid)

				displayCurrency := resolveDisplayCurrency(r, client, bypassCtx, uh, hid)
				if displayCurrency != nil {
					ctx = context.WithValue(ctx, contextkeys.DisplayCurrencyKey(), displayCurrency)
				}
			}

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func resolveDisplayCurrency(
	r *http.Request,
	client *ent.Client,
	ctx context.Context,
	uh *ent.UserHousehold,
	householdID int,
) *contextkeys.DisplayCurrency {
	headerStr := r.Header.Get("X-Display-Currency-ID")
	if headerStr != "" {
		hcID, err := strconv.Atoi(headerStr)
		if err == nil {
			hc, err := client.HouseholdCurrency.Query().
				Where(
					householdcurrency.IDEQ(hcID),
					householdcurrency.HouseholdIDEQ(householdID),
				).
				Only(ctx)
			if err == nil {
				return &contextkeys.DisplayCurrency{
					HouseholdCurrencyID: hc.ID,
					Code:                hc.Code,
				}
			}
		}
	}

	if uh.Edges.DefaultCurrency != nil {
		dc := uh.Edges.DefaultCurrency
		return &contextkeys.DisplayCurrency{
			HouseholdCurrencyID: dc.ID,
			Code:                dc.Code,
		}
	}

	return nil
}
