CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    type           VARCHAR(20)  NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    monthly_budget NUMERIC(12, 2),
    color          VARCHAR(7),
    created_at     TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_category_name_type UNIQUE (name, type)
);

CREATE TABLE transactions (
    id                BIGSERIAL PRIMARY KEY,
    type              VARCHAR(20)   NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    category_id       BIGINT        NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
    amount            NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description       VARCHAR(255)  NOT NULL,
    transaction_date  DATE          NOT NULL,
    is_fixed          BOOLEAN       NOT NULL DEFAULT FALSE,
    paid              BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_date ON transactions (transaction_date);
CREATE INDEX idx_transactions_category ON transactions (category_id);
CREATE INDEX idx_transactions_type ON transactions (type);

-- Seed a starter set of categories mirroring a typical monthly budget.
INSERT INTO categories (name, type, monthly_budget, color) VALUES
    ('Personal', 'EXPENSE', 150.00, '#8b5cf6'),
    ('Food', 'EXPENSE', 350.00, '#f97316'),
    ('Gifts/Donations', 'EXPENSE', 60.00, '#ec4899'),
    ('Entertainment', 'EXPENSE', 40.00, '#06b6d4'),
    ('Insurance', 'EXPENSE', 90.00, '#64748b'),
    ('Housing', 'EXPENSE', 320.00, '#3b82f6'),
    ('Utilities', 'EXPENSE', 110.00, '#14b8a6'),
    ('Transportation', 'EXPENSE', 35.00, '#eab308'),
    ('Healthcare', 'EXPENSE', 25.00, '#ef4444'),
    ('Salary', 'INCOME', NULL, '#22c55e'),
    ('Other', 'INCOME', NULL, '#84cc16');
