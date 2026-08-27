package com.financetracker.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        @NotNull(message = "Type is required") TransactionType type,
        @NotNull(message = "Category is required") Long categoryId,
        @NotNull(message = "Amount is required") @DecimalMin(value = "0.01", message = "Amount must be positive") BigDecimal amount,
        @NotBlank(message = "Description is required") String description,
        @NotNull(message = "Date is required") LocalDate transactionDate,
        boolean fixed,
        boolean paid
) {
}
