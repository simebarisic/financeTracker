package com.financetracker.transaction;

import com.financetracker.category.Category;
import com.financetracker.category.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository transactionRepository, CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<TransactionDto> findForMonth(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        return transactionRepository
                .findAllByTransactionDateBetweenOrderByTransactionDateDescIdDesc(ym.atDay(1), ym.atEndOfMonth())
                .stream()
                .map(TransactionDto::from)
                .toList();
    }

    @Transactional
    public TransactionDto create(TransactionRequest request) {
        Transaction transaction = new Transaction();
        applyRequest(transaction, request);
        return TransactionDto.from(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionDto update(Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transaction " + id + " not found"));
        applyRequest(transaction, request);
        return TransactionDto.from(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionDto setPaid(Long id, boolean paid) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transaction " + id + " not found"));
        transaction.setPaid(paid);
        return TransactionDto.from(transactionRepository.save(transaction));
    }

    @Transactional
    public void delete(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new EntityNotFoundException("Transaction " + id + " not found");
        }
        transactionRepository.deleteById(id);
    }

    /**
     * Copies fixed expenses from the source month into the target month so the user doesn't have to
     * re-type rent, subscriptions, etc. every month. New copies start as unpaid. Skips a source
     * transaction if a matching (category + description + fixed) transaction already exists in the
     * target month, so this is safe to run more than once.
     */
    @Transactional
    public List<TransactionDto> rolloverFixedExpenses(YearMonth from, YearMonth to) {
        List<Transaction> sourceFixed = transactionRepository
                .findAllByTransactionDateBetweenAndTypeAndFixedOrderByTransactionDateDesc(
                        from.atDay(1), from.atEndOfMonth(), TransactionType.EXPENSE, true);

        List<Transaction> existingInTarget = transactionRepository
                .findAllByTransactionDateBetween(to.atDay(1), to.atEndOfMonth());

        int targetLastDay = to.lengthOfMonth();

        List<Transaction> created = sourceFixed.stream()
                .filter(source -> existingInTarget.stream().noneMatch(existing ->
                        existing.isFixed()
                                && existing.getType() == TransactionType.EXPENSE
                                && Objects.equals(existing.getCategory().getId(), source.getCategory().getId())
                                && existing.getDescription().equalsIgnoreCase(source.getDescription())))
                .map(source -> {
                    Transaction copy = new Transaction();
                    copy.setType(TransactionType.EXPENSE);
                    copy.setCategory(source.getCategory());
                    copy.setAmount(source.getAmount());
                    copy.setDescription(source.getDescription());
                    int day = Math.min(source.getTransactionDate().getDayOfMonth(), targetLastDay);
                    copy.setTransactionDate(LocalDate.of(to.getYear(), to.getMonthValue(), day));
                    copy.setFixed(true);
                    copy.setPaid(false);
                    return copy;
                })
                .sorted(Comparator.comparing(Transaction::getTransactionDate))
                .toList();

        transactionRepository.saveAll(created);
        return created.stream().map(TransactionDto::from).toList();
    }

    private void applyRequest(Transaction transaction, TransactionRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category " + request.categoryId() + " not found"));

        if (!category.getType().name().equals(request.type().name())) {
            throw new IllegalArgumentException(
                    "Category '" + category.getName() + "' is a " + category.getType() +
                            " category and cannot be used for a " + request.type() + " transaction");
        }

        transaction.setType(request.type());
        transaction.setCategory(category);
        transaction.setAmount(request.amount());
        transaction.setDescription(request.description());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setFixed(request.type() == TransactionType.EXPENSE && request.fixed());
        transaction.setPaid(request.paid());
    }
}
