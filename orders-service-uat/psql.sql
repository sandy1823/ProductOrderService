CREATE TABLE IF NOT EXISTS tbl_order (
  order_id VARCHAR PRIMARY KEY,
  Invoice_id VARCHAR(255) NOT NULL,
  razorpay_order_id VARCHAR,
  buyer_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  client_id VARCHAR NOT NULL,
  receipt JSON,
  status INTEGER NOT NULL,
  remarks VARCHAR,
  updated_by VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP,
  cancelled_by JSON Default NULL,
  field_1 VARCHAR(255) Default NULL,
  field_2 VARCHAR(255) Default NULL,
  field_3 VARCHAR(255) Default NULL,
  CONSTRAINT fk_status FOREIGN KEY(status) REFERENCES tbl_status(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS tbl_refund (
  id SERIAL PRIMARY KEY,
  refund_id VARCHAR UNIQUE,
  order_id VARCHAR NOT NULL UNIQUE,
  razorpay_order_id VARCHAR NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  speed_requested VARCHAR(255),
  notes JSON DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP,
  status VARCHAR DEFAULT 'INITIATED',
  field_1 VARCHAR(255) Default NULL,
  field_2 VARCHAR(255) Default NULL,
  field_3 VARCHAR(255) Default NULL,
  CONSTRAINT fk_order_id FOREIGN KEY(order_id) REFERENCES tbl_order(order_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS tbl_status (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  before_status JSON,
  after_status JSON
);
INSERT INTO
  tbl_status(name, before_status, after_status)
values
  (
    'NEW',
    '{"id" : 2 ,"name" : "INPROGRESS" }',
    null
  ),
  (
    'INPROGRESS',
    '{"id" : 3 ,"name" : "DELIVERED" }',
    '{"id" : 1 ,"name" : "NEW" }'
  ),
  (
    'DELIVERED',
    null,
    '{"id" : 2 ,"name" : "INPROGRESS" }'
  ),
  ('CANCELLED', null, null),
  (
    'PENDING',
    null,
    '{"id" : 1 ,"name" : "NEW" }'
  );