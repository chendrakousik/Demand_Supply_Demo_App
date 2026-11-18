-- Run with a role authorized to grant privileges on both tables.
-- Use the target environment's database and API role.
GRANT DELETE ON TABLE SILICONFLOW_DEV.OPERATIONS.DEMAND TO ROLE SILICONFLOW_API;
GRANT DELETE ON TABLE SILICONFLOW_DEV.OPERATIONS.SUPPLY TO ROLE SILICONFLOW_API;
