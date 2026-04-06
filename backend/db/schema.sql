-- LogiEdge Billing Dashboard - Database Script
-- Run this script to set up the full database schema and seed data

-- Create Database (run separately if needed)
-- CREATE DATABASE logiEdge_db;

-- ============================================================
-- MASTER TABLES
-- ============================================================

-- Customer Master Table
CREATE TABLE IF NOT EXISTS customers (
  cust_id     VARCHAR(10)  PRIMARY KEY,
  cust_name   VARCHAR(150) NOT NULL,
  cust_address VARCHAR(255),
  cust_pan    VARCHAR(10)  NOT NULL,
  cust_gst    VARCHAR(15),
  is_active   CHAR(1)      NOT NULL DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Item Master Table
CREATE TABLE IF NOT EXISTS items (
  item_code     VARCHAR(10)    PRIMARY KEY,
  item_name     VARCHAR(150)   NOT NULL,
  selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
  is_active     CHAR(1)        NOT NULL DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
  created_at    TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRANSACTION TABLES
-- ============================================================

-- Invoice Header Table
CREATE TABLE IF NOT EXISTS invoices (
  invoice_id    VARCHAR(10)    PRIMARY KEY,
  cust_id       VARCHAR(10)    NOT NULL REFERENCES customers(cust_id),
  invoice_date  TIMESTAMP      NOT NULL DEFAULT NOW(),
  subtotal      NUMERIC(14, 2) NOT NULL DEFAULT 0,
  gst_rate      NUMERIC(5, 2)  NOT NULL DEFAULT 0,
  gst_amount    NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total_amount  NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- Invoice Line Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
  id          SERIAL         PRIMARY KEY,
  invoice_id  VARCHAR(10)    NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
  item_code   VARCHAR(10)    NOT NULL REFERENCES items(item_code),
  item_name   VARCHAR(150)   NOT NULL,
  unit_price  NUMERIC(12, 2) NOT NULL,
  quantity    INT            NOT NULL CHECK (quantity > 0),
  line_total  NUMERIC(14, 2) NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_invoices_cust_id    ON invoices(cust_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date       ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_items_inv   ON invoice_items(invoice_id);

-- ============================================================
-- SEED DATA - Customer Master
-- ============================================================
INSERT INTO customers (cust_id, cust_name, cust_address, cust_pan, cust_gst, is_active) VALUES
  ('C00001', 'Gupta Enterprize Pvt. Ltd.',  'Gurgaon, Haryana',          'BCNSG1234H', '06BCNSG1234H1Z5', 'Y'),
  ('C00002', 'Mahesh Industries Pvt. Ltd.', 'Delhi, Delhi',               'AMNSM1234U', '07AMNSM1234U1Z5', 'Y'),
  ('C00003', 'Omkar and Brothers Pvt. Ltd.','Uttrakhand, Uttar Pradesh',  'CNBSO1234S', '05CNBSO1234S1Z5', 'N'),
  ('C00004', 'Bhuwan Infotech.',            'Alwar, Rajasthan',           'CMNSB1234A', '08CMNSB1234A1Z5', 'Y'),
  ('C00005', 'Swastik Software Pvt. Ltd.',  'Gurgaon, Haryana',           'AGBCS1234B', '06AGBCS1234B1Z5', 'Y')
ON CONFLICT (cust_id) DO NOTHING;

-- ============================================================
-- SEED DATA - Item Master
-- ============================================================
INSERT INTO items (item_code, item_name, selling_price, is_active) VALUES
  ('IT00001', 'Laptop',      85000.00, 'Y'),
  ('IT00002', 'LED Monitor', 13450.00, 'Y'),
  ('IT00003', 'Pen Drive',     980.00, 'Y'),
  ('IT00004', 'Mobile',      18900.00, 'Y'),
  ('IT00005', 'Headphone',    2350.00, 'N'),
  ('IT00006', 'Bagpack',      1200.00, 'Y'),
  ('IT00007', 'Powerbank',    1400.00, 'Y')
ON CONFLICT (item_code) DO NOTHING;
