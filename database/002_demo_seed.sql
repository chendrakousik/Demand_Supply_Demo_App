-- Apply only to a development database. Existing IDs are preserved.
MERGE INTO MASTER_DATA.PRODUCTS T USING (
    SELECT VALUE:id::VARCHAR AS ID, VALUE AS PAYLOAD FROM TABLE(FLATTEN(INPUT => PARSE_JSON(
    '[{"id":"P-100","name":"Silicon Wafer 300 mm"},{"id":"P-200","name":"Power MOSFET"}]')))
) S ON T.ID = S.ID WHEN NOT MATCHED THEN INSERT (ID, PAYLOAD) VALUES (S.ID, S.PAYLOAD);

MERGE INTO MASTER_DATA.CUSTOMERS T USING (
    SELECT VALUE:id::VARCHAR AS ID, VALUE AS PAYLOAD FROM TABLE(FLATTEN(INPUT => PARSE_JSON(
    '[{"id":"C-100","name":"Vector Systems"},{"id":"C-200","name":"Horizon Devices"}]')))
) S ON T.ID = S.ID WHEN NOT MATCHED THEN INSERT (ID, PAYLOAD) VALUES (S.ID, S.PAYLOAD);

MERGE INTO MASTER_DATA.LOCATIONS T USING (
    SELECT VALUE:id::VARCHAR AS ID, VALUE AS PAYLOAD FROM TABLE(FLATTEN(INPUT => PARSE_JSON(
    '[{"id":"L-100","name":"Phoenix Fab"},{"id":"L-200","name":"Austin Fab"}]')))
) S ON T.ID = S.ID WHEN NOT MATCHED THEN INSERT (ID, PAYLOAD) VALUES (S.ID, S.PAYLOAD);

MERGE INTO MASTER_DATA.PRODUCT_LOCATION_MAPPINGS T USING (
    SELECT VALUE:id::VARCHAR AS ID, VALUE AS PAYLOAD FROM TABLE(FLATTEN(INPUT => PARSE_JSON(
    '[{"id":"P-100-L-100","productId":"P-100","locationId":"L-100"}]')))
) S ON T.ID = S.ID WHEN NOT MATCHED THEN INSERT (ID, PAYLOAD) VALUES (S.ID, S.PAYLOAD);

MERGE INTO OPERATIONS.DEMAND T USING (
    SELECT VALUE:id::VARCHAR AS ID, VALUE AS PAYLOAD FROM TABLE(FLATTEN(INPUT => PARSE_JSON(
    '[{"id":"D-100","productId":"P-100","customerId":"C-100","locationId":"L-100","date":"2026-10-23","quantity":70,"priority":1},{"id":"D-200","productId":"P-100","customerId":"C-200","locationId":"L-100","date":"2026-10-23","quantity":80,"priority":2},{"id":"D-300","productId":"P-200","customerId":"C-100","locationId":"L-200","date":"2026-10-23","quantity":20,"priority":1}]')))
) S ON T.ID = S.ID WHEN NOT MATCHED THEN INSERT (ID, PAYLOAD) VALUES (S.ID, S.PAYLOAD);

MERGE INTO OPERATIONS.SUPPLY T USING (
    SELECT VALUE:id::VARCHAR AS ID, VALUE AS PAYLOAD FROM TABLE(FLATTEN(INPUT => PARSE_JSON(
    '[{"id":"S-100","productId":"P-100","locationId":"L-100","date":"2026-10-20","quantity":60,"lot":"LOT-A"},{"id":"S-200","productId":"P-100","locationId":"L-100","date":"2026-10-21","quantity":40,"lot":"LOT-B"}]')))
) S ON T.ID = S.ID WHEN NOT MATCHED THEN INSERT (ID, PAYLOAD) VALUES (S.ID, S.PAYLOAD);
