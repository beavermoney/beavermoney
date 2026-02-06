CREATE OR REPLACE FUNCTION update_account_value_on_investment_change()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    -- Variables to help with sorting locks to prevent deadlocks
    first_account_id  INT;
    second_account_id INT;
BEGIN
    CASE TG_OP
        WHEN 'INSERT' THEN UPDATE accounts
                           SET value = value + NEW.value
                           WHERE id = NEW.account_id;

        WHEN 'DELETE' THEN UPDATE accounts
                           SET value = value - OLD.value
                           WHERE id = OLD.account_id;

        WHEN 'UPDATE'
            THEN -- 1. Check if the Account ID is the same (Optimization)
            IF NEW.account_id = OLD.account_id THEN
                -- Same account: Just apply the difference
                UPDATE accounts
                SET value = value + (NEW.value - OLD.value)
                WHERE id = NEW.account_id;

            ELSE
                -- 2. The Account ID changed. We must update TWO accounts.
                -- We must enforce Locking Order (Low ID -> High ID) to avoid deadlocks.

                -- A. Determine Order
                IF OLD.account_id < NEW.account_id THEN
                    first_account_id := OLD.account_id;
                    second_account_id := NEW.account_id;
                ELSE
                    first_account_id := NEW.account_id;
                    second_account_id := OLD.account_id;
                END IF;

                -- B. UPDATE THE FIRST (LOWER ID) ACCOUNT
                IF first_account_id = OLD.account_id THEN
                    -- This is the old account: Subtract old value
                    UPDATE accounts
                    SET value = value - OLD.value
                    WHERE id = first_account_id;
                ELSE
                    -- This is the new account: Add new value
                    UPDATE accounts
                    SET value = value + NEW.value
                    WHERE id = first_account_id;
                END IF;

                -- C. UPDATE THE SECOND (HIGHER ID) ACCOUNT
                IF second_account_id = OLD.account_id THEN
                    -- This is the old account: Subtract old value
                    UPDATE accounts
                    SET value = value - OLD.value
                    WHERE id = second_account_id;
                ELSE
                    -- This is the new account: Add new value
                    UPDATE accounts
                    SET value = value + NEW.value
                    WHERE id = second_account_id;
                END IF;
            END IF;
        END CASE;

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create the trigger
CREATE TRIGGER account_value_on_investment_change_trigger
    AFTER INSERT OR UPDATE OF amount, quote, value, account_id OR DELETE
    ON investments
    FOR EACH ROW
EXECUTE FUNCTION update_account_value_on_investment_change();
