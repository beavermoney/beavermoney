package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"time"

	sentryotel "github.com/getsentry/sentry-go/otel"
	gqlgen_opentelemetry "github.com/zhevron/gqlgen-opentelemetry"
	"go.opentelemetry.io/otel"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"

	"github.com/charmbracelet/log"

	_ "beavermoney.app/ent/runtime"
	"beavermoney.app/gql"
	"github.com/go-chi/httprate"

	"beavermoney.app/cmd/server/auth"
	"beavermoney.app/cmd/server/config"
	"beavermoney.app/cmd/server/database"
	"beavermoney.app/ent"
	"beavermoney.app/ent/user"
	"beavermoney.app/ent/userkey"
	"beavermoney.app/internal/contextkeys"
	"beavermoney.app/internal/frankfurter"
	"beavermoney.app/internal/market/crypto"
	"beavermoney.app/internal/market/stock"
	"beavermoney.app/internal/seed"
	"entgo.io/contrib/entgql"
	entsql "entgo.io/ent/dialect/sql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/getsentry/sentry-go"
	sentryhttp "github.com/getsentry/sentry-go/http"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"
	"github.com/markbates/goth/gothic"
)

var allowedReturnToRegex = regexp.MustCompile(
	`^https://[a-z0-9-]+-beavermoney-pr-\d+\.up\.railway\.app(/.*)?$`,
)

const returnToCookieName = "auth_return_to"

func isAllowedReturnTo(target string, cfg *config.Config) bool {
	if target == "" {
		return false
	}
	u, err := url.Parse(target)
	if err != nil {
		return false
	}

	// Allow if it matches the WebURL (base domain)
	webURL, _ := url.Parse(cfg.WebURL)
	if u.Host == webURL.Host {
		return true
	}

	return allowedReturnToRegex.MatchString(target)
}

func setReturnToCookie(res http.ResponseWriter, value string, secure bool) {
	http.SetCookie(res, &http.Cookie{
		Name:     returnToCookieName,
		Value:    value,
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   600,
	})
}

func consumeReturnToCookie(res http.ResponseWriter, req *http.Request, secure bool) string {
	c, err := req.Cookie(returnToCookieName)
	if err != nil {
		return ""
	}
	http.SetCookie(res, &http.Cookie{
		Name:     returnToCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
	return c.Value
}

func isProxyCallback(target string, cfg *config.Config) bool {
	if target == "" {
		return false
	}
	u, err := url.Parse(target)
	if err != nil {
		return false
	}
	// It's a proxy callback if it's NOT our local WebURL and it looks like an API callback path
	webURL, _ := url.Parse(cfg.WebURL)
	return u.Host != webURL.Host && (regexp.MustCompile(`/auth/[a-z]+/callback$`).MatchString(u.Path))
}

func provisionUser(ctx context.Context, client *ent.Client, email, name, providerUserID, provider string) (int, error) {
	// Create/update user
	userID, err := client.User.Create().
		SetEmail(email).
		SetName(name).
		OnConflict(entsql.ConflictColumns(user.FieldEmail)).
		Ignore().ID(contextkeys.NewPrivacyBypassContext(ctx))
	if err != nil {
		return 0, fmt.Errorf("failed creating user: %w", err)
	}

	// Create/update user key
	err = client.UserKey.Create().
		SetUserID(userID).
		SetKey(providerUserID).
		SetProvider(userkey.Provider(provider)).
		OnConflict(entsql.ConflictColumns(userkey.FieldProvider, userkey.FieldKey)).
		Ignore().Exec(contextkeys.NewPrivacyBypassContext(ctx))
	if err != nil {
		return 0, fmt.Errorf("failed creating user key: %w", err)
	}

	return userID, nil
}

func main() {
	ctx := context.Background()

	// Load config
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}

	// Setup logging
	logger := setupLogging(cfg.IsProd)

	// To initialize Sentry's handler, you need to initialize Sentry itself beforehand
	if err := sentry.Init(sentry.ClientOptions{
		Dsn: cfg.SentryDSN,
		// Set TracesSampleRate to 1.0 to capture 100%
		// of transactions for tracing.
		// We recommend adjusting this value in production,
		EnableTracing:    true,
		TracesSampleRate: 1.0,
		// Enable structured logs to Sentry
		EnableLogs:     true,
		SendDefaultPII: true,
	}); err != nil {
		logger.Error("Sentry initialization failed", "err", err)
	}
	defer sentry.Flush(time.Second)

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithSpanProcessor(sentryotel.NewSentrySpanProcessor()),
	)
	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(sentryotel.NewSentryPropagator())

	meter := sentry.NewMeter(context.Background())

	sentryMiddleware := sentryhttp.New(sentryhttp.Options{
		Repanic: true,
	})

	// Setup auth
	tokenAuth := auth.NewJWTAuth(cfg.JWTSecret)
	auth.SetupGoth(cfg)

	// Connect database
	entClient, db, err := database.Connect(cfg.PostgresURL)
	if err != nil {
		panic(err)
	}
	defer entClient.Close() //nolint:errcheck
	defer db.Close()        //nolint:errcheck

	// Run migrations
	if err := database.Migrate(db, logger); err != nil {
		panic(err)
	}

	// Setup internal clients
	frankfurterClient, err := frankfurter.NewClientWithResponses(cfg.FrankfurterBaseURL + "/v2")
	if err != nil {
		panic(fmt.Errorf("failed to create frankfurter client: %w", err))
	}

	if err := seed.Setup(ctx, entClient, frankfurterClient, logger); err != nil {
		logger.Error(
			"database setup failed",
			slog.String("error", err.Error()),
		)
		panic(err)
	}

	stockClient := stock.NewClient(stock.NewYahooProvider())
	cryptoClient := crypto.NewClient(crypto.NewCoinbaseProvider())

	if !cfg.IsProd {
		if err := seed.Seed(ctx, entClient, frankfurterClient, stockClient); err != nil {
			panic(err)
		}
	}

	// Setup router
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{cfg.WebURL},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-CSRF-Token",
			"sentry-trace",
			"X-Household-ID",
			"X-Display-Currency-ID",
			"baggage",
		},
		AllowCredentials: true,
		MaxAge:           300,
		Debug:            false,
	}))

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.Compress(5))
	r.Use(httprate.LimitByIP(100, time.Minute))
	r.Use(sentryMiddleware.Handle) // must be after Recoverer

	// Setup GQL
	gqlHandler := handler.NewDefaultServer(
		gql.NewSchema(
			logger,
			entClient,
			frankfurterClient,
			stockClient,
			cryptoClient,
			meter,
			otel.Tracer("beavermoney-server"),
		),
	)
	gqlHandler.Use(gqlgen_opentelemetry.Tracer{})
	gqlHandler.Use(entgql.Transactioner{TxOpener: entClient})

	r.Group(func(r chi.Router) {
		r.Use(jwtauth.Verifier(tokenAuth))
		r.Use(jwtauth.Authenticator(tokenAuth))
		r.Use(auth.Middleware(entClient))

		r.Handle("/query", gqlHandler)
	})

	r.Handle("/", playground.Handler("GraphQL playground", "/query"))

	// Setup Auth routes
	r.Get(
		"/auth/{provider}/callback",
		func(res http.ResponseWriter, req *http.Request) {
			p := req.PathValue("provider")

			// Scenario C: Receiving an identity token from a proxy
			if identityToken := req.URL.Query().Get("identity_token"); identityToken != "" {
				token, err := tokenAuth.Decode(identityToken)
				if err != nil {
					http.Error(res, "Invalid identity token", http.StatusUnauthorized)
					return
				}
				claims := token.PrivateClaims()

				email, _ := claims["email"].(string)
				name, _ := claims["name"].(string)
				providerUserID, _ := claims["provider_user_id"].(string)

				if email == "" || providerUserID == "" {
					http.Error(res, "Identity token missing required claims", http.StatusBadRequest)
					return
				}

				// Create/update local user
				userID, err := provisionUser(ctx, entClient, email, name, providerUserID, p)
				if err != nil {
					res.WriteHeader(http.StatusInternalServerError)
					logger.Error("failed provisioning user from identity", "error", err)
					return
				}

				_, tokenString, _ := tokenAuth.Encode(map[string]any{"user_id": strconv.Itoa(userID)})
				res.Header().Set("Location", cfg.WebURL+"/auth/callback?token="+tokenString)
				res.WriteHeader(http.StatusTemporaryRedirect)
				return
			}

			if !cfg.IsProd && p == "local" {
				// Bypass required: dev-only login shortcut runs before any JWT
				// is issued, so there is no UserIDKey/HouseholdIDKey for
				// FilterMeOrCoMember to use.
				userID := entClient.User.Query().
					Where(user.EmailEQ("joey@beavermoney.app")).
					OnlyIDX(contextkeys.NewPrivacyBypassContext(ctx))

				_, tokenString, _ := tokenAuth.Encode(
					map[string]any{
						"user_id": strconv.Itoa(userID),
					},
				)

				res.Header().
					Set("Location", cfg.WebURL+"/auth/callback?token="+tokenString)
				res.WriteHeader(http.StatusTemporaryRedirect)
				return
			}

			gothicUser, err := gothic.CompleteUserAuth(res, req)
			if err != nil {
				fmt.Fprintln(res, err) //nolint:errcheck
				return
			}

			returnTo := consumeReturnToCookie(res, req, cfg.IsProd)

			// Scenario B: Acting as a proxy for another environment
			if isProxyCallback(returnTo, cfg) {
				// We ONLY trust verified emails from Google for this handoff
				if gothicUser.Provider == "google" {
					if verifiedEmail, ok := gothicUser.RawData["verified_email"].(bool); !ok || !verifiedEmail {
						http.Error(res, "email not verified", http.StatusUnauthorized)
						return
					}
				}

				// Issue short-lived Identity Token
				_, identityToken, _ := tokenAuth.Encode(map[string]any{
					"email":            gothicUser.Email,
					"name":             gothicUser.Name,
					"provider_user_id": gothicUser.UserID,
					"exp":              time.Now().Add(5 * time.Minute).Unix(),
				})

				redirectURL, _ := url.Parse(returnTo)
				q := redirectURL.Query()
				q.Set("identity_token", identityToken)
				redirectURL.RawQuery = q.Encode()

				res.Header().Set("Location", redirectURL.String())
				res.WriteHeader(http.StatusTemporaryRedirect)
				return
			}

			// Scenario A: Standard local login
			switch gothicUser.Provider {
			case "google":
				if verifiedEmail, ok := gothicUser.RawData["verified_email"].(bool); !ok ||
					!verifiedEmail {
					fmt.Fprintln( //nolint:errcheck
						res,
						"email not verified or could not be determined",
					)
					return
				}

				// Create/update local user
				userID, err := provisionUser(ctx, entClient, gothicUser.Email, gothicUser.Name, gothicUser.UserID, string(userkey.ProviderGoogle))
				if err != nil {
					res.WriteHeader(http.StatusInternalServerError)
					logger.Error("failed provisioning user", "error", err)
					return
				}

				// TODO: implement short-lived token + refresh token
				_, tokenString, _ := tokenAuth.Encode(
					map[string]any{
						"user_id": strconv.Itoa(userID),
					},
				)

				redirectBase := cfg.WebURL
				if isAllowedReturnTo(returnTo, cfg) {
					redirectBase = returnTo
				}

				res.Header().
					Set("Location", redirectBase+"/auth/callback?token="+tokenString)
				res.WriteHeader(http.StatusTemporaryRedirect)

			default:
				fmt.Fprintf( //nolint:errcheck
					res,
					"provider %s not supported",
					gothicUser.Provider,
				)
				return
			}
		},
	)

	r.Get(
		"/logout/{provider}",
		func(res http.ResponseWriter, req *http.Request) {
			gothic.Logout(res, req) //nolint:errcheck

			res.Header().Set("Location", cfg.WebURL)
			res.WriteHeader(http.StatusTemporaryRedirect)
		},
	)

	proxyHost := ""
	if cfg.AuthProxyURL != "" {
		if u, err := url.Parse(cfg.AuthProxyURL); err == nil {
			proxyHost = u.Host
		}
	}

	r.Get("/auth/{provider}", func(res http.ResponseWriter, req *http.Request) {
		if cfg.AuthProxyURL != "" && req.Host != proxyHost {
			// Proxy to the auth server, but tell it to return to OUR callback
			scheme := "http"
			if req.TLS != nil || req.Header.Get("X-Forwarded-Proto") == "https" {
				scheme = "https"
			}
			localCallback := fmt.Sprintf("%s://%s/auth/%s/callback", scheme, req.Host, req.PathValue("provider"))

			target := cfg.AuthProxyURL + "/auth/" + req.PathValue("provider") +
				"?return_to=" + url.QueryEscape(localCallback)
			http.Redirect(res, req, target, http.StatusTemporaryRedirect)
			return
		}
		if returnTo := req.URL.Query().Get("return_to"); isAllowedReturnTo(returnTo, cfg) {
			setReturnToCookie(res, returnTo, cfg.IsProd)
		}
		gothic.BeginAuthHandler(res, req)
	})

	// Health check endpoint
	r.Get(
		"/health",
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("OK")) //nolint:errcheck
		}),
	)

	// Start server
	http.ListenAndServe(":"+cfg.Port, r) //nolint:errcheck
}

func setupLogging(isProd bool) *slog.Logger {
	logOptions := log.Options{
		ReportCaller:    true,
		ReportTimestamp: true,
	}
	if isProd {
		logOptions.Formatter = log.JSONFormatter
		logOptions.Level = log.InfoLevel
	} else {
		logOptions.TimeFormat = time.Kitchen
		logOptions.Level = log.DebugLevel
	}

	slogHandler := log.NewWithOptions(os.Stderr, logOptions)
	logger := slog.New(slogHandler)
	slog.SetDefault(logger)

	return logger
}
