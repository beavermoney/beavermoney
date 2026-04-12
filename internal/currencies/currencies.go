// Package currencies provides a hardcoded list of supported currencies.
// Currency codes follow ISO 4217. This list is intentionally static —
// ISO 4217 changes are extremely rare and can be updated manually.
package currencies

// Info holds metadata for a supported currency.
type Info struct {
	Code    string
	Locales []string
}

// Supported is the canonical list of currencies the app supports.
// Both the backend and frontend maintain identical lists (see web/src/lib/currencies.ts).
var Supported = []Info{
	{Code: "USD", Locales: []string{"en-US"}},
	{Code: "EUR", Locales: []string{"de-DE", "fr-FR", "es-ES", "it-IT", "nl-NL"}},
	{Code: "GBP", Locales: []string{"en-GB"}},
	{Code: "JPY", Locales: []string{"ja-JP"}},
	{Code: "CNY", Locales: []string{"zh-CN"}},
	{Code: "CAD", Locales: []string{"en-CA", "fr-CA"}},
	{Code: "AUD", Locales: []string{"en-AU"}},
	{Code: "KRW", Locales: []string{"ko-KR"}},
	{Code: "INR", Locales: []string{"en-IN", "hi-IN"}},
	{Code: "BRL", Locales: []string{"pt-BR"}},
}

// byCode is a lookup index populated at init time.
var byCode map[string]Info

func init() {
	byCode = make(map[string]Info, len(Supported))
	for _, c := range Supported {
		byCode[c.Code] = c
	}
}

// Lookup returns currency info by code and whether the code is valid.
func Lookup(code string) (Info, bool) {
	info, ok := byCode[code]
	return info, ok
}

// IsValid reports whether code is a supported currency.
func IsValid(code string) bool {
	_, ok := byCode[code]
	return ok
}

// Codes returns all supported currency codes.
func Codes() []string {
	codes := make([]string, len(Supported))
	for i, c := range Supported {
		codes[i] = c.Code
	}
	return codes
}
