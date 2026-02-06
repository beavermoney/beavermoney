CREATE OR REPLACE FUNCTION update_investment_amount()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    -- Variables to help with sorting locks
    first_investment_id  INT;
    second_investment_id INT;
BEGIN
    CASE TG_OP
        WHEN 'INSERT' THEN UPDATE investments
                           SET amount = amount + NEW.amount
                           WHERE id = NEW.investment_id;

        WHEN 'DELETE' THEN UPDATE investments
                           SET amount = amount - OLD.amount
                           WHERE id = OLD.investment_id;

        WHEN 'UPDATE'
            THEN -- 1. Check if the Investment ID (Foreign Key) is the same
            IF NEW.investment_id =
               OLD.investment_id THEN
                -- Same investment: Just apply the difference in amount
                UPDATE investments
                SET amount = amount + (NEW.amount - OLD.amount)
                WHERE id = NEW.investment_id;

            ELSE -- 2. The Investment ID changed. We must update TWO investment.
            -- We must enforce Locking Order (Low ID -> High ID) to avoid deadlocks.

                IF OLD.investment_id <
                   NEW.investment_id THEN
                    first_investment_id := OLD.investment_id;
                    second_investment_id := NEW.investment_id;
                ELSE
                    first_investment_id := NEW.investment_id;
                    second_investment_id := OLD.investment_id;
                END IF;

                -- UPDATE THE FIRST (LOWER ID) INVESTMENT
                IF first_investment_id = OLD.investment_id THEN
                    UPDATE investments
                    SET amount = amount - OLD.amount
                    WHERE id = first_investment_id;
                ELSE
                    UPDATE investments
                    SET amount = amount + NEW.amount
                    WHERE id = first_investment_id;
                END IF;

                -- UPDATE THE SECOND (HIGHER ID) INVESTMENT
                IF second_investment_id = OLD.investment_id THEN
                    UPDATE investments
                    SET amount = amount - OLD.amount
                    WHERE id = second_investment_id;
                ELSE
                    UPDATE investments
                    SET amount = amount + NEW.amount
                    WHERE id = second_investment_id;
                END IF;
            END IF;
        END CASE;

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create the trigger
CREATE TRIGGER investment_amount_trigger
    AFTER INSERT OR UPDATE OF amount, investment_id OR DELETE
    ON investment_lots
    FOR EACH ROW
EXECUTE FUNCTION update_investment_amount();
