package gql

import (
	"log/slog"

	"beavermoney.app/ent"
	"beavermoney.app/internal/frankfurter"
	"beavermoney.app/internal/market/crypto"
	"beavermoney.app/internal/market/stock"
	"github.com/99designs/gqlgen/graphql"
	"github.com/getsentry/sentry-go"
	"go.opentelemetry.io/otel/trace"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require
// here.

type Resolver struct {
	logger            *slog.Logger
	entClient         *ent.Client
	frankfurterClient *frankfurter.ClientWithResponses
	stockClient       *stock.Client
	cryptoClient      *crypto.Client
	meter             sentry.Meter
	tracer            trace.Tracer
}

// NewSchema creates a graphql executable schema.
func NewSchema(
	logger *slog.Logger,
	entClient *ent.Client,
	frankfurterClient *frankfurter.ClientWithResponses,
	stockClient *stock.Client,
	cryptoClient *crypto.Client,
	meter sentry.Meter,
	tracer trace.Tracer,
) graphql.ExecutableSchema {
	return NewExecutableSchema(Config{
		Resolvers: &Resolver{
			logger,
			entClient,
			frankfurterClient,
			stockClient,
			cryptoClient,
			meter,
			tracer,
		},
	})
}
