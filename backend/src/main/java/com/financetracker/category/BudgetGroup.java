package com.financetracker.category;

/**
 * Coarse 50/30/20-style bucket an expense category can be assigned to.
 * Only meaningful for {@link CategoryType#EXPENSE} categories.
 */
public enum BudgetGroup {
    NEEDS,
    WANTS,
    SAVINGS
}
