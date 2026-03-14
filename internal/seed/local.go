package seed

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"beavermoney.app/ent"
	"beavermoney.app/ent/account"
	"beavermoney.app/ent/currency"
	"beavermoney.app/ent/investment"
	"beavermoney.app/ent/transactioncategory"
	"beavermoney.app/ent/user"
	"beavermoney.app/ent/userhousehold"
	"beavermoney.app/internal/contextkeys"
	"beavermoney.app/internal/fxrate"
	"beavermoney.app/internal/market"
	"github.com/shopspring/decimal"
)

// Seed populates the database with test data for development.
func Seed(
	ctx context.Context,
	entClient *ent.Client,
	fxrateClient *fxrate.Client,
	marketClient *market.Client,
) error {
	alreadySeeded := entClient.User.Query().
		Where(user.EmailEQ("joey@beavermoney.app")).
		ExistX(contextkeys.NewPrivacyBypassContext(ctx))
	if alreadySeeded {
		return nil
	}

	cad := entClient.Currency.Query().Where(currency.CodeEQ("CAD")).OnlyX(ctx)
	entClient.Currency.Query().Where(currency.CodeEQ("CNY")).OnlyX(ctx)
	usd := entClient.Currency.Query().Where(currency.CodeEQ("USD")).OnlyX(ctx)

	usdToCadRate, err := fxrateClient.GetRate(ctx, "USD", "CAD", time.Now())
	if err != nil {
		panic(err)
	}

	joey := entClient.User.Create().
		SetEmail("joey@beavermoney.app").
		SetName("Joey").
		SaveX(ctx)

	household := entClient.Household.Create().
		SetName("Joey's Household").
		SetCurrency(cad).
		SetLocale("en-CA").
		SaveX(ctx)

	ctx = context.WithValue(ctx, contextkeys.HouseholdIDKey(), household.ID)

	if err = SeedHouseholdCategories(ctx, entClient, household.ID); err != nil {
		panic(err)
	}

	household2 := entClient.Household.Create().
		SetName("Acme Corp").
		SetCurrency(cad).
		SetLocale("en-CA").
		SaveX(ctx)

	entClient.UserHousehold.Create().
		SetUser(joey).
		SetHousehold(household).
		SetRole(userhousehold.RoleAdmin).
		SaveX(ctx)

	ctx = context.WithValue(ctx, contextkeys.HouseholdIDKey(), household2.ID)

	entClient.UserHousehold.Create().
		SetUser(joey).
		SetHousehold(household2).
		SetRole(userhousehold.RoleAdmin).
		SaveX(ctx)

	differentJoey := entClient.User.Create().
		SetEmail("joey@jyu.dev").
		SetName("Different Joey").
		SaveX(ctx)

	differentHousehold := entClient.Household.Create().
		SetName("Different Joey's Household").
		SetCurrency(cad).
		SetLocale("en-CA").
		SaveX(ctx)

	differentCtx := context.WithValue(
		ctx,
		contextkeys.HouseholdIDKey(),
		differentHousehold.ID,
	)

	entClient.UserHousehold.Create().
		SetUser(differentJoey).
		SetHousehold(differentHousehold).
		SetRole(userhousehold.RoleAdmin).
		SaveX(differentCtx)

	entClient.UserHousehold.Create().
		SetUser(differentJoey).
		SetHousehold(household).
		SetRole(userhousehold.RoleMember).
		SaveX(ctx)

	entClient.Account.Create().
		SetName("You should not see this account").
		SetCurrency(usd).
		SetFxRate(usdToCadRate).
		SetUser(differentJoey).
		SetHousehold(differentHousehold).
		SetType(account.TypeLiquidity).
		SaveX(differentCtx)

	ctx = context.WithValue(ctx, contextkeys.HouseholdIDKey(), household.ID)

	chase := entClient.Account.Create().
		SetName("Chase Total Checking").
		SetCurrency(usd).
		SetFxRate(usdToCadRate).
		SetIcon("chase.com").
		SetUser(joey).
		SetHousehold(household).
		SetType(account.TypeLiquidity).
		SaveX(ctx)

	wealthsimple := entClient.Account.Create().
		SetName("Wealthsimple Visa Infinite").
		SetUser(joey).
		SetIcon("wealthsimple.com").
		SetFxRate(decimal.NewFromInt(1)).
		SetCurrency(cad).
		SetHousehold(household).
		SetType(account.TypeLiability).
		SaveX(ctx)

	webull := entClient.Account.Create().
		SetHousehold(household).
		SetFxRate(decimal.NewFromInt(1)).
		SetIcon("webull.ca").
		SetName("Webull").
		SetUser(joey).
		SetCurrency(cad).
		SetType(account.TypeInvestment).
		SaveX(ctx)

	restaurant := entClient.TransactionCategory.Query().
		Where(
			transactioncategory.NameEQ("Restaurant"),
		).
		OnlyX(ctx)

	grocery := entClient.TransactionCategory.Query().
		Where(
			transactioncategory.NameEQ("Grocery"),
		).
		OnlyX(ctx)

	buyCategory := entClient.TransactionCategory.Query().
		Where(
			transactioncategory.NameEQ("Buy"),
		).
		OnlyX(ctx)

	salary := entClient.TransactionCategory.Query().
		Where(
			transactioncategory.NameEQ("Salary"),
		).
		OnlyX(ctx)

	{
		transaction := entClient.Transaction.Create().
			SetUser(joey).
			SetHousehold(household).
			SetCategory(salary).
			SetDatetime(genRandomDatetime()).SaveX(ctx)
		entClient.TransactionEntry.Create().
			SetAccount(chase).
			SetHousehold(household).
			SetTransaction(transaction).
			SetCurrency(usd).
			SetAmount(decimal.NewFromInt(1000000)).SaveX(ctx)
	}

	{
		const n = 1000
		txCreates := make([]*ent.TransactionCreate, n)
		for i := range txCreates {
			txCreates[i] = entClient.Transaction.Create().
				SetUser(joey).
				SetHousehold(household).
				SetCategory(restaurant).
				SetDatetime(genRandomDatetime())
		}
		transactions := entClient.Transaction.CreateBulk(txCreates...).
			SaveX(ctx)

		txEntryCreates := make([]*ent.TransactionEntryCreate, n)
		for i, t := range transactions {
			txEntryCreates[i] = entClient.TransactionEntry.Create().
				SetAccount(chase).
				SetHousehold(household).
				SetTransaction(t).
				SetCurrency(usd).
				SetAmount(genRandomAmount().Mul(decimal.NewFromInt(-1)))
		}
		entClient.TransactionEntry.CreateBulk(txEntryCreates...).SaveX(ctx)
	}

	{
		const n = 1000
		txCreates := make([]*ent.TransactionCreate, n)
		for i := range txCreates {
			txCreates[i] = entClient.Transaction.Create().
				SetUser(joey).
				SetHousehold(household).
				SetCategory(grocery).
				SetDatetime(genRandomDatetime())
		}
		transactions := entClient.Transaction.CreateBulk(txCreates...).
			SaveX(ctx)

		txEntryCreates := make([]*ent.TransactionEntryCreate, n)
		for i, t := range transactions {
			txEntryCreates[i] = entClient.TransactionEntry.Create().
				SetAccount(wealthsimple).
				SetHousehold(household).
				SetTransaction(t).
				SetCurrency(cad).
				SetAmount(genRandomAmount().Mul(decimal.NewFromInt(-1)))
		}
		entClient.TransactionEntry.CreateBulk(txEntryCreates...).SaveX(ctx)
	}

	xeqtQuote, err := marketClient.StockQuote(ctx, "XEQT.TO")
	if err != nil {
		panic(err)
	}

	xeqt := entClient.Investment.Create().
		SetHousehold(household).
		SetSymbol("XEQT.TO").
		SetName("XEQT").
		SetQuote(xeqtQuote.CurrentPrice).
		SetCurrency(cad).
		SetType(investment.TypeStock).
		SetAccount(webull).
		SaveX(ctx)

	{
		transaction := entClient.Transaction.Create().
			SetUser(joey).
			SetHousehold(household).
			SetCategory(buyCategory).
			SetDatetime(genRandomDatetime()).SaveX(ctx)

		entClient.InvestmentLot.Create().
			SetInvestment(xeqt).
			SetTransaction(transaction).
			SetHousehold(household).
			SetAmount(decimal.NewFromInt(100)).
			SetPrice(decimal.NewFromFloat(25.50)).
			SaveX(ctx)
	}

	{
		transaction := entClient.Transaction.Create().
			SetUser(joey).
			SetHousehold(household).
			SetCategory(buyCategory).
			SetDatetime(genRandomDatetime()).SaveX(ctx)
		entClient.InvestmentLot.Create().
			SetInvestment(xeqt).
			SetTransaction(transaction).
			SetHousehold(household).
			SetAmount(decimal.NewFromInt(50)).
			SetPrice(decimal.NewFromFloat(27.75)).
			SaveX(ctx)
	}

	return nil
}

// SeedDemoHousehold creates realistic demo data for a new household with weekly checkpoints.
// Data is built incrementally over 6 months (26 weeks) with accurate checkpoints after each week.
func SeedDemoHousehold(
	ctx context.Context,
	client *ent.Client,
	household *ent.Household,
	userID int,
	fxrateClient *fxrate.Client,
	marketClient *market.Client,
) error {
	// Load household currency
	householdCurrency, err := household.QueryCurrency().Only(ctx)
	if err != nil {
		return fmt.Errorf("failed to load household currency: %w", err)
	}

	// Demo household is always CAD / Canada
	config := getDemoConfig()

	// Create accounts (backdated to 6 months ago)
	startDate := time.Now().AddDate(0, -6, 0).UTC()
	accounts, err := createDemoAccounts(
		ctx,
		client,
		household,
		userID,
		householdCurrency,
		config,
		startDate,
	)
	if err != nil {
		return fmt.Errorf("failed to create demo accounts: %w", err)
	}

	// Get categories
	categories, err := getCategories(ctx, client)
	if err != nil {
		return fmt.Errorf("failed to get categories: %w", err)
	}

	// Fetch and create investments
	investments, err := fetchAndCreateInvestments(
		ctx,
		client,
		household,
		accounts.investment,
		householdCurrency,
		config,
		marketClient,
		startDate,
	)
	if err != nil {
		return fmt.Errorf("failed to create investments: %w", err)
	}

	// Build data week by week with checkpoints
	currentDate := startDate
	for weekNumber := 0; weekNumber < 26; weekNumber++ {
		weekStart := currentDate
		weekEnd := weekStart.AddDate(0, 0, 7)

		// First week: initial salary
		if weekNumber == 0 {
			if err := createTransaction(ctx, client, weekStart, accounts.checking, categories.salary, config.monthlySalary, household, userID); err != nil {
				return fmt.Errorf("failed to create initial salary: %w", err)
			}
		}

		// Monthly salary (every ~4 weeks)
		if weekNumber%4 == 0 && weekNumber > 0 {
			if err := createTransaction(ctx, client, weekStart, accounts.checking, categories.salary, config.monthlySalary, household, userID); err != nil {
				return fmt.Errorf(
					"failed to create salary for week %d: %w",
					weekNumber,
					err,
				)
			}
		}

		// Weekly expenses
		if err := createWeeklyExpenses(ctx, client, weekStart, weekEnd, accounts.creditCard, categories, household, userID, weekNumber); err != nil {
			return fmt.Errorf(
				"failed to create expenses for week %d: %w",
				weekNumber,
				err,
			)
		}

		// Investment purchases (every 3 weeks)
		if weekNumber%3 == 0 {
			if err := buyInvestmentShares(ctx, client, weekStart.AddDate(0, 0, 3), investments, categories.buy, household, userID, weekNumber); err != nil {
				return fmt.Errorf(
					"failed to buy investments for week %d: %w",
					weekNumber,
					err,
				)
			}
		}

		// Create checkpoint at end of week
		checkpointDate := weekEnd.Add(-1 * time.Hour)
		if err := createCheckpointAtDate(ctx, client, household, householdCurrency, checkpointDate); err != nil {
			return fmt.Errorf(
				"failed to create checkpoint for week %d: %w",
				weekNumber,
				err,
			)
		}

		currentDate = weekEnd
	}

	return nil
}

// demoConfig holds configuration for the demo household (CAD / Canada).
type demoConfig struct {
	checkingName   string
	checkingIcon   string
	creditCardName string
	creditCardIcon string
	investmentName string
	investmentIcon string
	etfSymbol      string
	stockSymbols   []string
	monthlySalary  decimal.Decimal
}

func getDemoConfig() demoConfig {
	return demoConfig{
		checkingName:   "TD Chequing Account",
		checkingIcon:   "td.com",
		creditCardName: "Wealthsimple Visa Infinite",
		creditCardIcon: "wealthsimple.com",
		investmentName: "Webull",
		investmentIcon: "webull.ca",
		etfSymbol:      "VFV.TO",
		stockSymbols:   []string{"SHOP.TO", "META", "TD.TO"},
		monthlySalary:  decimal.NewFromInt(6500),
	}
}

// demoAccounts holds the created accounts
type demoAccounts struct {
	checking   *ent.Account
	creditCard *ent.Account
	investment *ent.Account
}

func createDemoAccounts(
	ctx context.Context,
	client *ent.Client,
	household *ent.Household,
	userID int,
	householdCurrency *ent.Currency,
	config demoConfig,
	createdAt time.Time,
) (*demoAccounts, error) {
	checking, err := client.Account.Create().
		SetName(config.checkingName).
		SetIcon(config.checkingIcon).
		SetCurrency(householdCurrency).
		SetFxRate(decimal.NewFromInt(1)).
		SetUserID(userID).
		SetHouseholdID(household.ID).
		SetType(account.TypeLiquidity).
		SetCreateTime(createdAt).
		Save(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create checking account: %w", err)
	}
	checking.Edges.Currency = householdCurrency

	creditCard, err := client.Account.Create().
		SetName(config.creditCardName).
		SetIcon(config.creditCardIcon).
		SetCurrency(householdCurrency).
		SetFxRate(decimal.NewFromInt(1)).
		SetUserID(userID).
		SetHouseholdID(household.ID).
		SetType(account.TypeLiability).
		SetCreateTime(createdAt).
		Save(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create credit card account: %w", err)
	}
	creditCard.Edges.Currency = householdCurrency

	investmentAccount, err := client.Account.Create().
		SetName(config.investmentName).
		SetIcon(config.investmentIcon).
		SetCurrency(householdCurrency).
		SetFxRate(decimal.NewFromInt(1)).
		SetUserID(userID).
		SetHouseholdID(household.ID).
		SetType(account.TypeInvestment).
		SetCreateTime(createdAt).
		Save(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create investment account: %w", err)
	}
	investmentAccount.Edges.Currency = householdCurrency

	return &demoAccounts{
		checking:   checking,
		creditCard: creditCard,
		investment: investmentAccount,
	}, nil
}

// categorySet holds commonly used categories
type categorySet struct {
	restaurant     *ent.TransactionCategory
	grocery        *ent.TransactionCategory
	transportation *ent.TransactionCategory
	subscription   *ent.TransactionCategory
	salary         *ent.TransactionCategory
	buy            *ent.TransactionCategory
}

func getCategories(
	ctx context.Context,
	client *ent.Client,
) (*categorySet, error) {
	restaurant, err := client.TransactionCategory.Query().
		Where(transactioncategory.NameEQ("Restaurant")).
		Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get restaurant category: %w", err)
	}

	grocery, err := client.TransactionCategory.Query().
		Where(transactioncategory.NameEQ("Grocery")).
		Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get grocery category: %w", err)
	}

	transportation, err := client.TransactionCategory.Query().
		Where(transactioncategory.NameEQ("Transportation")).
		Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get transportation category: %w", err)
	}

	subscription, err := client.TransactionCategory.Query().
		Where(transactioncategory.NameEQ("Subscription")).
		Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get subscription category: %w", err)
	}

	salary, err := client.TransactionCategory.Query().
		Where(transactioncategory.NameEQ("Salary")).
		Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get salary category: %w", err)
	}

	buy, err := client.TransactionCategory.Query().
		Where(transactioncategory.NameEQ("Buy")).
		Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get buy category: %w", err)
	}

	return &categorySet{
		restaurant:     restaurant,
		grocery:        grocery,
		transportation: transportation,
		subscription:   subscription,
		salary:         salary,
		buy:            buy,
	}, nil
}

// investmentSet holds created investments
type investmentSet struct {
	etf    *ent.Investment
	stocks []*ent.Investment
}

func fetchAndCreateInvestments(
	ctx context.Context,
	client *ent.Client,
	household *ent.Household,
	investmentAccount *ent.Account,
	householdCurrency *ent.Currency,
	config demoConfig,
	marketClient *market.Client,
	createdAt time.Time,
) (*investmentSet, error) {
	// Fetch ETF quote
	etfQuote, err := marketClient.StockQuote(ctx, config.etfSymbol)
	if err != nil {
		return nil, fmt.Errorf(
			"failed to fetch ETF quote for %s: %w",
			config.etfSymbol,
			err,
		)
	}

	etf, err := client.Investment.Create().
		SetHouseholdID(household.ID).
		SetSymbol(config.etfSymbol).
		SetName(config.etfSymbol).
		SetQuote(etfQuote.CurrentPrice).
		SetCurrency(householdCurrency).
		SetType(investment.TypeStock).
		SetAccount(investmentAccount).
		SetCreateTime(createdAt).
		Save(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create ETF investment: %w", err)
	}

	// Fetch and create stock investments
	stocks := make([]*ent.Investment, 0, len(config.stockSymbols))
	for _, symbol := range config.stockSymbols {
		quote, err := marketClient.StockQuote(ctx, symbol)
		if err != nil {
			return nil, fmt.Errorf(
				"failed to fetch stock quote for %s: %w",
				symbol,
				err,
			)
		}

		stock, err := client.Investment.Create().
			SetHouseholdID(household.ID).
			SetSymbol(symbol).
			SetName(symbol).
			SetQuote(quote.CurrentPrice).
			SetCurrency(householdCurrency).
			SetType(investment.TypeStock).
			SetAccount(investmentAccount).
			SetCreateTime(createdAt).
			Save(ctx)
		if err != nil {
			return nil, fmt.Errorf(
				"failed to create stock investment %s: %w",
				symbol,
				err,
			)
		}

		stocks = append(stocks, stock)
	}

	return &investmentSet{
		etf:    etf,
		stocks: stocks,
	}, nil
}

// createTransaction creates a transaction with backdated timestamp
func createTransaction(
	ctx context.Context,
	client *ent.Client,
	date time.Time,
	account *ent.Account,
	category *ent.TransactionCategory,
	amount decimal.Decimal,
	household *ent.Household,
	userID int,
) error {
	tx, err := client.Transaction.Create().
		SetUserID(userID).
		SetHouseholdID(household.ID).
		SetCategory(category).
		SetDatetime(date).
		SetCreateTime(date).
		Save(ctx)
	if err != nil {
		return fmt.Errorf("failed to create transaction: %w", err)
	}

	_, err = client.TransactionEntry.Create().
		SetAccount(account).
		SetHouseholdID(household.ID).
		SetTransaction(tx).
		SetCurrency(account.Edges.Currency).
		SetAmount(amount).
		SetCreateTime(date).
		Save(ctx)
	if err != nil {
		return fmt.Errorf("failed to create transaction entry: %w", err)
	}

	return nil
}

// createWeeklyExpenses creates realistic expenses for a week
func createWeeklyExpenses(
	ctx context.Context,
	client *ent.Client,
	weekStart, weekEnd time.Time,
	creditCard *ent.Account,
	categories *categorySet,
	household *ent.Household,
	userID int,
	weekNumber int,
) error {
	// 2-3 restaurant visits per week
	for i := 0; i < 2+rand.Intn(2); i++ {
		day := rand.Intn(7)
		date := weekStart.AddDate(0, 0, day).
			Add(time.Duration(8+rand.Intn(12)) * time.Hour)
		if err := createTransaction(ctx, client, date, creditCard, categories.restaurant, genRandomRestaurantAmount(), household, userID); err != nil {
			return err
		}
	}

	// 1 grocery trip per week
	groceryDay := 2 + rand.Intn(5)
	groceryDate := weekStart.AddDate(0, 0, groceryDay).
		Add(time.Duration(10+rand.Intn(8)) * time.Hour)
	if err := createTransaction(ctx, client, groceryDate, creditCard, categories.grocery, genRandomGroceryAmount(), household, userID); err != nil {
		return err
	}

	// 1-2 transportation expenses per week
	for i := 0; i < 1+rand.Intn(2); i++ {
		day := rand.Intn(7)
		date := weekStart.AddDate(0, 0, day).
			Add(time.Duration(7+rand.Intn(10)) * time.Hour)
		if err := createTransaction(ctx, client, date, creditCard, categories.transportation, genRandomTransportationAmount(), household, userID); err != nil {
			return err
		}
	}

	// Subscriptions at start of month (week 0, 4, 8, 12, 16, 20, 24)
	if weekNumber%4 == 0 {
		subscriptions := []decimal.Decimal{
			decimal.NewFromFloat(-9.99),  // Netflix
			decimal.NewFromFloat(-19.99), // Gym
			decimal.NewFromFloat(-5.99),  // Cloud storage
		}
		for i, amount := range subscriptions {
			date := weekStart.AddDate(0, 0, i).Add(time.Duration(9) * time.Hour)
			if err := createTransaction(ctx, client, date, creditCard, categories.subscription, amount, household, userID); err != nil {
				return err
			}
		}
	}

	return nil
}

// buyInvestmentShares purchases investment shares at different intervals
func buyInvestmentShares(
	ctx context.Context,
	client *ent.Client,
	date time.Time,
	investments *investmentSet,
	buyCategory *ent.TransactionCategory,
	household *ent.Household,
	userID int,
	weekNumber int,
) error {
	// Alternate between ETF and stock purchases
	switch weekNumber % 9 {
	case 0:
		// Buy ETF
		return buyShares(
			ctx,
			client,
			date,
			investments.etf,
			buyCategory,
			household,
			userID,
			decimal.NewFromInt(50),
			0.95,
		)
	case 3:
		// Buy first stock
		if len(investments.stocks) > 0 {
			return buyShares(
				ctx,
				client,
				date,
				investments.stocks[0],
				buyCategory,
				household,
				userID,
				decimal.NewFromInt(5),
				0.92,
			)
		}
	case 6:
		// Buy second stock
		if len(investments.stocks) > 1 {
			return buyShares(
				ctx,
				client,
				date,
				investments.stocks[1],
				buyCategory,
				household,
				userID,
				decimal.NewFromInt(8),
				0.88,
			)
		}
	case 9:
		// Buy third stock
		if len(investments.stocks) > 2 {
			return buyShares(
				ctx,
				client,
				date,
				investments.stocks[2],
				buyCategory,
				household,
				userID,
				decimal.NewFromInt(3),
				0.90,
			)
		}
	}
	return nil
}

// buyShares creates an investment lot purchase
func buyShares(
	ctx context.Context,
	client *ent.Client,
	date time.Time,
	investment *ent.Investment,
	buyCategory *ent.TransactionCategory,
	household *ent.Household,
	userID int,
	shares decimal.Decimal,
	priceMultiplier float64,
) error {
	tx, err := client.Transaction.Create().
		SetUserID(userID).
		SetHouseholdID(household.ID).
		SetCategory(buyCategory).
		SetDatetime(date).
		SetCreateTime(date).
		Save(ctx)
	if err != nil {
		return fmt.Errorf("failed to create buy transaction: %w", err)
	}

	price := investment.Quote.Mul(decimal.NewFromFloat(priceMultiplier))

	_, err = client.InvestmentLot.Create().
		SetInvestment(investment).
		SetTransaction(tx).
		SetHouseholdID(household.ID).
		SetAmount(shares).
		SetPrice(price).
		SetCreateTime(date).
		Save(ctx)
	if err != nil {
		return fmt.Errorf("failed to create investment lot: %w", err)
	}

	return nil
}

// createCheckpointAtDate creates a checkpoint at a specific historical date
func createCheckpointAtDate(
	ctx context.Context,
	client *ent.Client,
	household *ent.Household,
	householdCurrency *ent.Currency,
	checkpointDate time.Time,
) error {
	// Query all accounts — FxRate is already stored on each account
	accounts, err := client.Account.Query().
		Where(account.HouseholdIDEQ(household.ID)).
		All(ctx)
	if err != nil {
		return fmt.Errorf("failed to query accounts: %w", err)
	}

	// Calculate totals by account type
	zero := decimal.NewFromInt(0)
	liquidity := zero
	investment := zero
	property := zero
	receivable := zero
	liability := zero

	for _, acc := range accounts {
		convertedValue := acc.Value.Mul(acc.FxRate)

		switch acc.Type {
		case account.TypeLiquidity:
			liquidity = liquidity.Add(convertedValue)
		case account.TypeInvestment:
			investment = investment.Add(convertedValue)
		case account.TypeProperty:
			property = property.Add(convertedValue)
		case account.TypeReceivable:
			receivable = receivable.Add(convertedValue)
		case account.TypeLiability:
			liability = liability.Add(convertedValue)
		}
	}

	netWorth := liquidity.Add(investment).
		Add(property).
		Add(receivable).
		Add(liability)

	// Create checkpoint with backdated timestamp
	_, err = client.Checkpoint.Create().
		SetHouseholdID(household.ID).
		SetCurrencyID(householdCurrency.ID).
		SetNetWorth(netWorth).
		SetLiquidity(liquidity).
		SetInvestment(investment).
		SetProperty(property).
		SetReceivable(receivable).
		SetLiability(liability).
		SetCreateTime(checkpointDate).
		Save(ctx)

	return err
}

// Helper functions for realistic amounts
func genRandomRestaurantAmount() decimal.Decimal {
	min, max := 15.0, 75.0
	amount := min + rand.Float64()*(max-min)
	return decimal.NewFromFloat(-amount).Round(2)
}

func genRandomGroceryAmount() decimal.Decimal {
	min, max := 30.0, 150.0
	amount := min + rand.Float64()*(max-min)
	return decimal.NewFromFloat(-amount).Round(2)
}

func genRandomTransportationAmount() decimal.Decimal {
	min, max := 5.0, 60.0
	amount := min + rand.Float64()*(max-min)
	return decimal.NewFromFloat(-amount).Round(2)
}

func genRandomAmount() decimal.Decimal {
	minInt := 0
	maxInt := 10000
	randomInt := rand.Intn(maxInt-minInt) + minInt

	return decimal.NewFromInt(int64(randomInt)).Div(decimal.NewFromInt(100))
}

func genRandomDatetime() time.Time {
	return time.Now().Add(time.Duration(-rand.Intn(365*24)) * time.Hour).UTC()
}
