package com.financetracker.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionDto(
        Long id,
        TransactionType type,
        Long categoryId,
        String categoryName,
        String categoryColor,
        BigDecimal amount,
        String description,
        LocalDate transactionDate,
        boolean fixed,
        boolean paid
) {
    public static TransactionDto from(Transaction t) {
        return new TransactionDto(
                t.getId(),
                t.getType(),
                t.getCategory().getId(),
                t.getCategory().getName(),
                t.getCategory().getColor(),
                t.getAmount(),
                t.getDescription(),
                t.getTransactionDate(),
                t.isFixed(),
                t.isPaid()
        );
    }
}
