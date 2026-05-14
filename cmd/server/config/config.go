package config

import (
	"os"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

// Config holds the application configuration loaded from environment variables.
type Config struct {
	PostgresURL string `env:"POSTGRES_URL,notEmpty"`

	WebURL string `env:"WEB_URL,notEmpty"`

	Port string `env:"PORT,notEmpty"`

	GoogleClientID     string `env:"GOOGLE_CLIENT_ID"`
	GoogleClientSecret string `env:"GOOGLE_CLIENT_SECRET"`
	GoogleRedirectURL  string `env:"GOOGLE_REDIRECT_URL"`

	SessionSecret string `env:"SESSION_SECRET,notEmpty"`
	JWTSecret     string `env:"JWT_SECRET,notEmpty"`

	FrankfurterBaseURL string `env:"FRANKFURTER_BASE_URL"`

	EODHDAPIKey       string `env:"EODHD_API_KEY"`
	MarketstackAPIKey string `env:"MARKETSTACK_API_KEY"`

	SentryDSN string `env:"SENTRY_DSN"`

	IsProd bool
}

// Load reads environment variables and returns a Config struct.
// In non-production environments, it loads .env file first.
func Load() (*Config, error) {
	isProd := os.Getenv("RAILWAY_PUBLIC_DOMAIN") != ""

	if !isProd {
		if err := godotenv.Load(); err != nil {
			return nil, err
		}
	}

	cfg, err := env.ParseAs[Config]()
	if err != nil {
		return nil, err
	}

	cfg.IsProd = isProd

	return &cfg, nil
}
