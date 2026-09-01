package com.financetracker.dashboard;

import com.financetracker.category.BudgetGroup;
import com.financetracker.category.CategoryType;

import java.math.BigDecimal;

public record CategoryBreakdownDto(
        Long categoryId,
        String name,
        CategoryType type,
        String color,
        BigDecimal spent,
        BigDecimal budget,
        BudgetGroup budgetGroup,
        Double percentUsed,
        boolean overBudget
) {
}
