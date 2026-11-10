import snowflake from 'snowflake-sdk'
import type { Batch, Demand, Master, Restriction, Result, Run, Supply } from './domain.ts'
import { fixtures } from './fixtures.ts'

export type Records = {
  products: Master; customers: Master; locations: Master
  mappings: { id: string; productId: string; locationId: string }
  demand: Demand; supply: Supply; batches: Batch; restrictions: Restriction; runs: Run
  results: Result & { id: string; runId: string }
  shortages: { id: string; runId: string; demandId: string; productId: string; customerId: string; quantity: number }
}
export type Table = keyof Records
type Write = { [K in Table]: { table: K; rows: Records[K][] } }[Table]

export interface Store {
  read<K extends Table>(table: K): Promise<Records[K][]>
  write(writes: Write[]): Promise<void>
}

export function createDemoStore(): Store {
  const tables = new Map<Table, Map<string, Records[Table]>>()
  function tableFor(key: Table) {
    let rows = tables.get(key)
    if (!rows) {
      rows = new Map((fixtures[key] ?? []).map(row => [row.id, row]))
      tables.set(key, rows)
    }
    return rows
  }
  return {
    async read<K extends Table>(table: K) {
      return structuredClone([...tableFor(table).values()]) as Records[K][]
    },
    async write(writes) {
      for (const { table, rows } of writes) {
        for (const row of rows) tableFor(table).set(row.id, structuredClone(row))
      }
    },
  }
}

const tables: Record<Table, string> = {
  products: 'MASTER_DATA.PRODUCTS', customers: 'MASTER_DATA.CUSTOMERS',
  locations: 'MASTER_DATA.LOCATIONS', mappings: 'MASTER_DATA.PRODUCT_LOCATION_MAPPINGS',
  demand: 'OPERATIONS.DEMAND', supply: 'OPERATIONS.SUPPLY', batches: 'APP.UPLOAD_BATCHES',
  restrictions: 'PLANNING.RESTRICTIONS', runs: 'PLANNING.ALLOCATION_RUNS',
  results: 'PLANNING.ALLOCATION_RESULTS', shortages: 'PLANNING.SHORTAGES',
}

function required(key: string) {
  const value = process.env[key]
  if (!value) throw new Error('Missing environment setting ' + key)
  return value
}

export async function createSnowflakeStore(): Promise<Store> {
  const connection = snowflake.createConnection({
    account: required('SNOWFLAKE_ACCOUNT'),
    username: required('SNOWFLAKE_USER'),
    role: required('SNOWFLAKE_ROLE'),
    database: required('SNOWFLAKE_DATABASE'),
    warehouse: required('SNOWFLAKE_WAREHOUSE'),
    authenticator: 'SNOWFLAKE_JWT',
    privateKeyPath: required('SNOWFLAKE_PRIVATE_KEY_PATH'),
    privateKeyPass: process.env.SNOWFLAKE_PRIVATE_KEY_PASSPHRASE,
    clientSessionKeepAlive: true,
  })
  await new Promise<void>((resolve, reject) => connection.connect(error => error ? reject(error) : resolve()))
  function execute(sqlText: string, binds: string[] = []) {
    return new Promise<{ PAYLOAD: string }[]>((resolve, reject) => connection.execute({
      sqlText, binds,
      complete: (error, _statement, rows) => error ? reject(error) : resolve(rows ?? []),
    }))
  }

  let tail = Promise.resolve<unknown>(undefined)
  function serialize<T>(work: () => Promise<T>) {
    const result = tail.then(work)
    tail = result.catch(() => undefined)
    return result
  }

  await execute('SELECT 1')
  return {
    read<K extends Table>(table: K) {
      return serialize(async () => (await execute('SELECT TO_JSON(payload) AS PAYLOAD FROM ' + tables[table]))
        .map(row => JSON.parse(row.PAYLOAD) as Records[K]))
    },
    write(writes) {
      return serialize(async () => {
        await execute('BEGIN')
        try {
          for (const { table, rows } of writes) {
            for (let offset = 0; offset < rows.length; offset += 500) {
              const values = JSON.stringify(rows.slice(offset, offset + 500))
              await execute(
                'MERGE INTO ' + tables[table] + ' target USING ' +
                '(SELECT value:id::VARCHAR AS id, value AS payload FROM TABLE(FLATTEN(INPUT => PARSE_JSON(?)))) source ' +
                'ON target.id = source.id WHEN MATCHED THEN UPDATE SET payload = source.payload ' +
                'WHEN NOT MATCHED THEN INSERT (id, payload) VALUES (source.id, source.payload)', [values],
              )
            }
          }
          await execute('COMMIT')
        } catch (error) {
          await execute('ROLLBACK')
          throw error
        }
      })
    },
  }
}
