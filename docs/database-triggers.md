# Database Triggers

This document describes the PostgreSQL triggers that automatically maintain derived/aggregate fields in the Beaver Money database.

## Overview

Beaver Money uses database triggers to maintain data consistency and avoid the need for manual balance/value calculations in application code. The trigger system maintains:

- **Account balances**: Cash portion from transaction entries
- **Account values**: Total value including cash + investments
- **Investment amounts**: Total shares/units from investment lots
- **Investment values**: Computed from amount × quote price

## Trigger Architecture

### 1. Transaction Entry → Account Balance & Value

**Trigger**: `transaction_balance_and_value_on_transaction_entry_change_trigger`
**Function**: `update_account_balance_and_value_on_transaction_entry_change()`
**Table**: `transaction_entries`  
**Events**: `AFTER INSERT OR UPDATE OF amount, account_id OR DELETE`

**Purpose**: Maintains `accounts.balance` and `accounts.value` based on transaction entries.

**Behavior**:

- **INSERT**: Adds `NEW.amount` to account's balance and value
- **DELETE**: Subtracts `OLD.amount` from account's balance and value
- **UPDATE (same account)**: Applies the difference `(NEW.amount - OLD.amount)`
- **UPDATE (account changed)**: Updates both OLD and NEW accounts with deadlock prevention

**Deadlock Prevention**: When updating two accounts (account_id change), locks are acquired in ascending ID order to prevent circular wait conditions.

```sql
-- Example: Moving $100 between accounts
UPDATE transaction_entries
SET account_id = 456, amount = 100
WHERE id = 1 AND account_id = 123;

-- Result:
-- Account 123: balance -= 100, value -= 100
-- Account 456: balance += 100, value += 100
-- (Updates happen in ID order: 123 then 456, or 456 then 123)
```

### 2. Investment Lot → Investment Amount

**Trigger**: `investment_amount_trigger`  
**Function**: `update_investment_amount()`  
**Table**: `investment_lots`  
**Events**: `AFTER INSERT OR UPDATE OF amount, investment_id OR DELETE`

**Purpose**: Maintains `investments.amount` (total shares/units) by aggregating investment lots.

**Behavior**:

- **INSERT**: Adds `NEW.amount` to investment's total amount
- **DELETE**: Subtracts `OLD.amount` from investment's total amount
- **UPDATE (same investment)**: Applies the difference `(NEW.amount - OLD.amount)`
- **UPDATE (investment changed)**: Updates both OLD and NEW investments with deadlock prevention

```sql
-- Example: Adding 10 shares to an investment
INSERT INTO investment_lots (investment_id, amount, price, ...)
VALUES (5, 10, 150.50, ...);

-- Result:
-- Investment 5: amount += 10
```

### 3. Investment Amount/Quote → Investment Value

**Trigger**: `investment_value_trigger`  
**Function**: `update_investment_value()`  
**Table**: `investments`  
**Events**: `BEFORE INSERT OR UPDATE OF amount, quote`

**Purpose**: Calculates `investments.value` as `amount × quote` **before** the row is saved.

**Key Detail**: This is a **BEFORE trigger**, so `NEW.value` is computed before the row is written. This ensures the value is correct before the next trigger fires.

```sql
-- Example: Quote price update
UPDATE investments SET quote = 155.75 WHERE id = 5;

-- Result (BEFORE row is saved):
-- NEW.value = NEW.amount * NEW.quote
-- If amount = 100, then value = 100 * 155.75 = 15575
```

### 4. Investment Value → Account Value

**Trigger**: `account_value_on_investment_change_trigger`  
**Function**: `update_account_value_on_investment_change()`  
**Table**: `investments`  
**Events**: `AFTER INSERT OR UPDATE OF amount, quote, value, account_id OR DELETE`

**Purpose**: Maintains `accounts.value` by propagating investment value changes.

**Behavior**:

- **INSERT**: Adds `NEW.value` to account's value (balance unchanged)
- **DELETE**: Subtracts `OLD.value` from account's value
- **UPDATE (same account)**: Applies the difference `(NEW.value - OLD.value)`
- **UPDATE (account changed)**: Updates both OLD and NEW accounts with deadlock prevention

**Important**: This trigger fires **after** trigger #3, so `NEW.value` is already computed.

```sql
-- Example: Quote price changes from 150 to 155.75 for 100 shares
UPDATE investments SET quote = 155.75 WHERE id = 5 AND account_id = 10;

-- Trigger flow:
-- 1. BEFORE trigger: NEW.value = 100 * 155.75 = 15575
-- 2. Row is saved with new value
-- 3. AFTER trigger: Account 10: value += (15575 - 15000) = +575
```

## Trigger Cascade Flow

When a transaction entry is created/modified, here's the full cascade:

```
1. transaction_entries INSERT/UPDATE/DELETE
   ↓
2. update_account_balance_and_value_on_transaction_entry_change()
   → Updates accounts.balance and accounts.value (cash portion)

When an investment lot is created/modified:

1. investment_lots INSERT/UPDATE/DELETE
   ↓
2. update_investment_amount()
   → Updates investments.amount
   ↓
3. BEFORE investments UPDATE (trigger #3)
   → Computes investments.value = amount × quote
   ↓
4. AFTER investments UPDATE (trigger #4)
   → Updates accounts.value (investment portion)
```

## Schema Fields Maintained by Triggers

| Table         | Field     | Updated By     | Description                                    |
| ------------- | --------- | -------------- | ---------------------------------------------- |
| `accounts`    | `balance` | Trigger #1     | Cash balance from transaction entries          |
| `accounts`    | `value`   | Trigger #1, #4 | Total value = balance + sum(investment values) |
| `investments` | `amount`  | Trigger #2     | Total shares/units from lots                   |
| `investments` | `value`   | Trigger #3     | Computed: amount × quote                       |

## Concurrency & Deadlock Prevention

All triggers that may update two rows (when foreign keys change) implement **lock ordering**:

1. Determine which account/investment ID is lower
2. Lock and update the lower ID first
3. Lock and update the higher ID second

This ensures that concurrent transactions always acquire locks in the same order, preventing circular wait conditions (deadlocks).

## Important Notes

1. **Immutable Schema Fields**: The Ent schema marks these fields as `Immutable()`, but triggers CAN and DO modify them. The immutability is enforced at the application/GraphQL layer, not the database layer.

2. **BEFORE vs AFTER**: Trigger #3 is BEFORE to ensure `investment.value` is computed before trigger #4 propagates it to `account.value`.

3. **Cascade Deletions**: The schema defines `entsql.OnDelete(entsql.Cascade)` for `transaction → transaction_entries` and `transaction → investment_lots`. Triggers handle the cleanup of balances/values when entries are cascade-deleted.

4. **Testing Considerations**: When testing, remember that these triggers fire automatically. You cannot manually set `balance` or `value` fields - they are maintained by the database.

## Migration Files

- **20251227201721_balance-trigger**: Transaction entry → Account balance & value
- **20251228225913_amount-trigger**: Investment lot → Investment amount
- **20251229010253_value-trigger**: Investment amount/quote → Investment value (BEFORE)
- **20251229010254_balance-trigger**: Investment value → Account value (AFTER)
