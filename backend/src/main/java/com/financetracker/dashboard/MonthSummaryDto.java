package com.financetracker.dashboard;

import java.math.BigDecimal;
import java.util.List;

public record MonthSummaryDto(
        int year,
        int month,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal totalFixedExpenses,
        BigDecimal totalVariableExpenses,
        BigDecimal balance,
        BigDecimal unpaidFixedExpenses,
        List<CategoryBreakdownDto> categories
) {
}
