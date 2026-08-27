package com.financetracker.dashboard;

import com.financetracker.category.Category;
import com.financetracker.category.CategoryRepository;
import com.financetracker.category.CategoryType;
import com.financetracker.transaction.Transaction;
import com.financetracker.transaction.TransactionRepository;
import com.financetracker.transaction.TransactionType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public DashboardService(TransactionRepository transactionRepository, CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    public MonthSummaryDto summary(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        List<Transaction> transactions = transactionRepository
                .findAllByTransactionDateBetween(ym.atDay(1), ym.atEndOfMonth());

        BigDecimal totalIncome = sum(transactions, t -> t.getType() == TransactionType.INCOME);
        BigDecimal totalFixedExpenses = sum(transactions, t -> t.getType() == TransactionType.EXPENSE && t.isFixed());
        BigDecimal totalVariableExpenses = sum(transactions, t -> t.getType() == TransactionType.EXPENSE && !t.isFixed());
        BigDecimal totalExpenses = totalFixedExpenses.add(totalVariableExpenses);
        BigDecimal balance = totalIncome.subtract(totalExpenses);
        BigDecimal unpaidFixed = sum(transactions,
                t -> t.getType() == TransactionType.EXPENSE && t.isFixed() && !t.isPaid());

        Map<Long, BigDecimal> spentByCategory = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getId(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)));

        List<CategoryBreakdownDto> categories = categoryRepository.findAllByOrderByTypeAscNameAsc().stream()
                .map(category -> toBreakdown(category, spentByCategory.getOrDefault(category.getId(), BigDecimal.ZERO)))
                .filter(dto -> dto.spent().compareTo(BigDecimal.ZERO) > 0 || dto.type() == CategoryType.EXPENSE)
                .sorted(Comparator.comparing(CategoryBreakdownDto::spent).reversed())
                .toList();

        return new MonthSummaryDto(year, month, totalIncome, totalExpenses, totalFixedExpenses,
                totalVariableExpenses, balance, unpaidFixed, categories);
    }

    public List<TrendPointDto> trend(YearMonth from, YearMonth to) {
        long monthsBetween = ChronoUnit.MONTHS.between(from, to);
        return Stream.iterate(from, ym -> ym.plusMonths(1))
                .limit(monthsBetween + 1)
                .map(ym -> {
                    List<Transaction> transactions = transactionRepository
                            .findAllByTransactionDateBetween(ym.atDay(1), ym.atEndOfMonth());
                    BigDecimal income = sum(transactions, t -> t.getType() == TransactionType.INCOME);
                    BigDecimal expenses = sum(transactions, t -> t.getType() == TransactionType.EXPENSE);
                    return new TrendPointDto(ym.getYear(), ym.getMonthValue(), income, expenses, income.subtract(expenses));
                })
                .toList();
    }

    private CategoryBreakdownDto toBreakdown(Category category, BigDecimal spent) {
        BigDecimal budget = category.getMonthlyBudget();
        Double percentUsed = null;
        boolean overBudget = false;
        if (budget != null && budget.compareTo(BigDecimal.ZERO) > 0) {
            percentUsed = spent.divide(budget, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            overBudget = spent.compareTo(budget) > 0;
        }
        return new CategoryBreakdownDto(category.getId(), category.getName(), category.getType(),
                category.getColor(), spent, budget, percentUsed, overBudget);
    }

    private BigDecimal sum(List<Transaction> transactions, java.util.function.Predicate<Transaction> filter) {
        return transactions.stream()
                .filter(filter)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
