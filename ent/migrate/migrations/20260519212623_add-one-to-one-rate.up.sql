INSERT INTO household_rates (rate, household_id, from_household_currency_id,
                             to_household_currency_id, create_time, update_time)
SELECT 1.0 AS rate,
       h.id,
       hc.id,
       hc.id,
       now(),
       now()
FROM households h
         CROSS JOIN
     household_currencies hc
WHERE h.id = hc.household_id
