package com.financetracker.dashboard;

import java.math.BigDecimal;

public record TrendPointDto(
        int year,
        int month,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal balance
) {
}
