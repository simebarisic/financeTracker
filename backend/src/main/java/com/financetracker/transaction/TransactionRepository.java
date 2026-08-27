package com.financetracker.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // JOIN FETCH loads the category together with each transaction in one query, instead of a lazy
    // proxy that would only resolve inside an open Hibernate session. Since open-in-view is disabled,
    // that session is normally closed by the time the DTOs/CSV are built, so without the fetch this
    // throws "could not initialize proxy ... - no Session".
    @Query("SELECT t FROM Transaction t JOIN FETCH t.category " +
            "WHERE t.transactionDate BETWEEN :start AND :end " +
            "ORDER BY t.transactionDate DESC, t.id DESC")
    List<Transaction> findAllByTransactionDateBetweenOrderByTransactionDateDescIdDesc(
            @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT t FROM Transaction t JOIN FETCH t.category " +
            "WHERE t.transactionDate BETWEEN :start AND :end " +
            "AND t.type = :type AND t.fixed = :fixed " +
            "ORDER BY t.transactionDate DESC")
    List<Transaction> findAllByTransactionDateBetweenAndTypeAndFixedOrderByTransactionDateDesc(
            @Param("start") LocalDate start, @Param("end") LocalDate end,
            @Param("type") TransactionType type, @Param("fixed") boolean fixed);

    @Query("SELECT t FROM Transaction t JOIN FETCH t.category " +
            "WHERE t.transactionDate BETWEEN :start AND :end")
    List<Transaction> findAllByTransactionDateBetween(
            @Param("start") LocalDate start, @Param("end") LocalDate end);
}
