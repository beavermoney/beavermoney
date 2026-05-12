package gql

import (
	"fmt"

	"github.com/shopspring/decimal"
)

func setDecimalPtr(target **decimal.Decimal, data *string, fieldName string) error {
	if data == nil || *data == "" {
		*target = nil
		return nil
	}
	dec, err := decimal.NewFromString(*data)
	if err != nil {
		return fmt.Errorf("invalid decimal string for %s: %v", fieldName, err)
	}
	*target = &dec
	return nil
}

func setDecimalValue(target *decimal.Decimal, data string, fieldName string) error {
	dec, err := decimal.NewFromString(data)
	if err != nil {
		return fmt.Errorf("invalid decimal string for %s: %v", fieldName, err)
	}
	*target = dec
	return nil
}

func setDecimalSlice(target *[]decimal.Decimal, data []string, fieldName string) error {
	if len(data) == 0 {
		*target = nil
		return nil
	}
	out := make([]decimal.Decimal, 0, len(data))
	for _, s := range data {
		dec, err := decimal.NewFromString(s)
		if err != nil {
			return fmt.Errorf("invalid decimal string for %s: %v", fieldName, err)
		}
		out = append(out, dec)
	}
	*target = out
	return nil
}
