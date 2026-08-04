-- 1. Ledger Table
CREATE TABLE IF NOT EXISTS purchase_ledger (
  token_hash VARCHAR(64) PRIMARY KEY,
  firebase_uid VARCHAR(128) NOT NULL,
  provider VARCHAR(32) NOT NULL,
  product_id VARCHAR(128) NOT NULL,
  purchase_token_ciphertext TEXT NOT NULL,
  purchase_token_iv VARCHAR(32) NOT NULL,
  purchase_token_tag VARCHAR(32) NOT NULL,
  encryption_key_version VARCHAR(16) NOT NULL,
  order_id VARCHAR(128),
  purchase_state VARCHAR(32) NOT NULL,
  entitlement_status VARCHAR(64) NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  purchased_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  firestore_sync_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error_code VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_ledger_provider_order_id
ON purchase_ledger (provider, order_id) WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_purchase_ledger_uid ON purchase_ledger(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_purchase_ledger_status ON purchase_ledger(entitlement_status);
CREATE INDEX IF NOT EXISTS idx_purchase_ledger_expiry ON purchase_ledger(expires_at);
CREATE INDEX IF NOT EXISTS idx_purchase_ledger_state ON purchase_ledger(purchase_state);

-- 2. Sync Jobs Table (Durable Queue)
CREATE TABLE IF NOT EXISTS entitlement_sync_jobs (
  id SERIAL PRIMARY KEY,
  ledger_id VARCHAR(64) NOT NULL REFERENCES purchase_ledger(token_hash) ON DELETE CASCADE,
  job_type VARCHAR(32) NOT NULL, -- 'FIRESTORE_SYNC' | 'ACKNOWLEDGEMENT'
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DEAD_LETTER'
  attempt_count INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  locked_at TIMESTAMPTZ,
  locked_by VARCHAR(128),
  last_error_code VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_jobs_status_next
ON entitlement_sync_jobs(status, next_attempt_at);

-- 3. Billing Events Table (Auditing)
CREATE TABLE IF NOT EXISTS billing_events (
  id SERIAL PRIMARY KEY,
  ledger_id VARCHAR(64) NOT NULL REFERENCES purchase_ledger(token_hash) ON DELETE CASCADE,
  event_type VARCHAR(64) NOT NULL, -- 'VERIFY_REQUEST' | 'ACK_SUCCESS' | 'SYNC_SUCCESS'
  provider_event_id VARCHAR(128),
  idempotency_key VARCHAR(128) UNIQUE NOT NULL,
  sanitized_payload JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_billing_events_provider_event_id
ON billing_events (provider_event_id) WHERE provider_event_id IS NOT NULL;
