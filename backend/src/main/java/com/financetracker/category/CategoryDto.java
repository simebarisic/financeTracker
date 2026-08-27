package com.financetracker.category;

import java.math.BigDecimal;

public record CategoryDto(
        Long id,
        String name,
        CategoryType type,
        BigDecimal monthlyBudget,
        String color
) {
    public static CategoryDto from(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getMonthlyBudget(),
                category.getColor()
        );
    }
}
