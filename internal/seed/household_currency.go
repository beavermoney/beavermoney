package seed

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"beavermoney.app/ent"
	"beavermoney.app/ent/householdcurrency"
	"beavermoney.app/ent/householdrate"
	"beavermoney.app/ent/userhousehold"
	"beavermoney.app/internal/contextkeys"
	"beavermoney.app/internal/frankfurter"
	"entgo.io/ent/dialect/sql"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/shopspring/decimal"
)

type migrateCurrency struct {
	ID   int
	Code string
}

// migrateHouseholdCurrencies is an idempotent backfill.
// For each household: ensures the primary household currency exists, populates
// household_rates for existing household currencies, and sets each
// user_household's default_currency_id to the primary household_currency.
func migrateHouseholdCurrencies(
	ctx context.Context,
	client *ent.Client,
	frankfurterClient *frankfurter.ClientWithResponses,
	logger *slog.Logger,
) error {
	bypassCtx := contextkeys.NewPrivacyBypassContext(ctx)

	households, err := client.Household.Query().
		All(bypassCtx)
	if err != nil {
		return fmt.Errorf("failed to query households: %w", err)
	}

	for _, hh := range households {
		logger.Info(
			"Migrating household currencies",
			"householdID",
			hh.ID,
			"householdName",
			hh.Name,
		)

		if err := migrateOneHousehold(bypassCtx, client, frankfurterClient, logger, hh); err != nil {
			return fmt.Errorf("failed to migrate household %d: %w", hh.ID, err)
		}

		logger.Info("Household currencies migrated",
			"householdID", hh.ID,
			"primaryCurrency", hh.CurrencyCode,
		)
	}

	return nil
}

func migrateOneHousehold(
	ctx context.Context,
	client *ent.Client,
	frankfurterClient *frankfurter.ClientWithResponses,
	logger *slog.Logger,
	hh *ent.Household,
) error {
	tx, err := client.Tx(ctx)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	txClient := tx.Client()
	householdCtx := context.WithValue(ctx, contextkeys.HouseholdIDKey(), hh.ID)

	primaryHC, err := getOrCreateHouseholdCurrency(
		householdCtx,
		txClient,
		hh.ID,
		hh.CurrencyCode,
		true,
	)
	if err != nil {
		return rollback(tx, fmt.Errorf("failed to create primary household currency: %w", err))
	}

	householdCurrencies, err := txClient.HouseholdCurrency.Query().
		Where(householdcurrency.HouseholdIDEQ(hh.ID)).
		All(householdCtx)
	if err != nil {
		return rollback(tx, fmt.Errorf("failed to query household currencies: %w", err))
	}

	allCurrencies := make([]migrateCurrency, 0, len(householdCurrencies))
	for _, hc := range householdCurrencies {
		allCurrencies = append(allCurrencies, migrateCurrency{ID: hc.ID, Code: hc.Code})
	}

	if len(allCurrencies) > 1 {
		if err := populateHouseholdRates(householdCtx, txClient, frankfurterClient, hh.ID, allCurrencies); err != nil {
			logger.Error(
				"Failed to populate household rates (non-fatal)",
				"error",
				err,
				"householdID",
				hh.ID,
			)
		}
	}

	userHouseholds, err := txClient.UserHousehold.Query().
		Where(userhousehold.HouseholdIDEQ(hh.ID)).
		All(ctx)
	if err != nil {
		return rollback(tx, fmt.Errorf("failed to query user_households: %w", err))
	}

	for _, uh := range userHouseholds {
		if uh.DefaultCurrencyID != nil {
			continue
		}
		err = txClient.UserHousehold.UpdateOneID(uh.ID).
			SetDefaultCurrencyID(primaryHC.ID).
			Exec(ctx)
		if err != nil {
			return rollback(
				tx,
				fmt.Errorf(
					"failed to set display_currency_id for user_household %d: %w",
					uh.ID,
					err,
				),
			)
		}
	}

	return tx.Commit()
}

func rollback(tx *ent.Tx, err error) error {
	if rerr := tx.Rollback(); rerr != nil {
		return fmt.Errorf("%w: %v", err, rerr)
	}
	return err
}

func populateHouseholdRates(
	ctx context.Context,
	client *ent.Client,
	frankfurterClient *frankfurter.ClientWithResponses,
	householdID int,
	currencies []migrateCurrency,
) error {
	now := openapi_types.Date{Time: time.Now().UTC()}

	codeToID := make(map[string]int, len(currencies))
	for _, c := range currencies {
		codeToID[c.Code] = c.ID
	}

	var rateBuilders []*ent.HouseholdRateCreate

	for _, from := range currencies {
		var quoteCodes []string
		for _, to := range currencies {
			if to.ID != from.ID {
				quoteCodes = append(quoteCodes, to.Code)
			}
		}
		if len(quoteCodes) == 0 {
			continue
		}

		quotes := strings.Join(quoteCodes, ",")
		resp, err := frankfurterClient.GetRatesWithResponse(ctx, &frankfurter.GetRatesParams{
			Date:   &now,
			Base:   &from.Code,
			Quotes: &quotes,
		})
		if err != nil {
			return fmt.Errorf("failed to fetch FX rates for base %s: %w", from.Code, err)
		}
		if resp.JSON200 == nil {
			return fmt.Errorf(
				"no rates returned for base %s (status: %s)",
				from.Code,
				resp.Status(),
			)
		}

		for _, rate := range *resp.JSON200 {
			toID, ok := codeToID[rate.Quote]
			if !ok {
				continue
			}
			rateBuilders = append(rateBuilders, client.HouseholdRate.Create().
				SetHouseholdID(householdID).
				SetFromCurrencyID(from.ID).
				SetToCurrencyID(toID).
				SetRate(decimal.NewFromFloat32(rate.Rate).Round(6)),
			)
		}
	}

	if len(rateBuilders) > 0 {
		err := client.HouseholdRate.CreateBulk(rateBuilders...).
			OnConflict(
				sql.ConflictColumns(
					householdrate.FieldHouseholdID,
					householdrate.FieldFromHouseholdCurrencyID,
					householdrate.FieldToHouseholdCurrencyID,
				),
			).
			Ignore().
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to bulk create household rates: %w", err)
		}
	}

	return nil
}
