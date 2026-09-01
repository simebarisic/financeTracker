package com.financetracker.category;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record CategoryRequest(
        @NotBlank(message = "Name is required") String name,
        @NotNull(message = "Type is required") CategoryType type,
        @DecimalMin(value = "0.0", message = "Budget cannot be negative") BigDecimal monthlyBudget,
        BudgetGroup budgetGroup,
        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "Color must be a hex value like #a1b2c3")
        String color
) {
}
