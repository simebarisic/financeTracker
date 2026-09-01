ALTER TABLE categories
    ADD COLUMN budget_group VARCHAR(20) CHECK (budget_group IN ('NEEDS', 'WANTS', 'SAVINGS'));

-- Give the seeded starter categories a sensible 50/30/20 default so the
-- Dashboard grouping isn't empty out of the box. Users can change these
-- freely on the Categories page.
UPDATE categories SET budget_group = 'NEEDS'
WHERE type = 'EXPENSE' AND name IN ('Housing', 'Utilities', 'Insurance', 'Healthcare', 'Transportation', 'Food');

UPDATE categories SET budget_group = 'WANTS'
WHERE type = 'EXPENSE' AND name IN ('Personal', 'Entertainment', 'Gifts/Donations');
