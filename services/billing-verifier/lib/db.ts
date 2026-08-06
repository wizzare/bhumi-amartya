export interface BillingQueryResult<Row = Record<string, unknown>> {
  rows: Row[];
  rowCount?: number;
  command?: string;
  fields?: unknown[];
}

export interface BillingDbClient {
  query<Row = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<BillingQueryResult<Row>>;
  release(): void;
}

export interface BillingDbPool {
  query<Row = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<BillingQueryResult<Row>>;
  connect(): Promise<BillingDbClient>;
  end?(): Promise<void>;
}
