package com.financetracker.transaction;

import com.financetracker.category.Category;
import com.financetracker.category.CategoryRepository;
import com.financetracker.category.CategoryType;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class CsvService {

    private static final String[] HEADERS = {
            "type", "category", "amount", "description", "date", "fixed", "paid"
    };

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public CsvService(TransactionRepository transactionRepository, CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    public String export(List<Transaction> transactions) {
        StringWriter writer = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(writer, CSVFormat.DEFAULT.builder().setHeader(HEADERS).build())) {
            for (Transaction t : transactions) {
                printer.printRecord(
                        t.getType(),
                        t.getCategory().getName(),
                        t.getAmount(),
                        t.getDescription(),
                        t.getTransactionDate(),
                        t.isFixed(),
                        t.isPaid()
                );
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return writer.toString();
    }

    public record ImportResult(int imported, List<String> errors) {
    }

    @Transactional
    public ImportResult importCsv(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        List<Transaction> toSave = new ArrayList<>();

        try (var reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            CSVFormat format = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .build();
            CSVParser parser = format.parse(reader);

            int rowNum = 1;
            for (CSVRecord record : parser) {
                rowNum++;
                try {
                    toSave.add(parseRow(record));
                } catch (Exception ex) {
                    errors.add("Row " + rowNum + ": " + ex.getMessage());
                }
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }

        transactionRepository.saveAll(toSave);
        return new ImportResult(toSave.size(), errors);
    }

    private Transaction parseRow(CSVRecord record) {
        TransactionType type = TransactionType.valueOf(record.get("type").trim().toUpperCase());
        String categoryName = record.get("category").trim();
        BigDecimal amount = new BigDecimal(record.get("amount").trim());
        String description = record.get("description").trim();
        LocalDate date = LocalDate.parse(record.get("date").trim());
        boolean fixed = type == TransactionType.EXPENSE && parseBoolean(record, "fixed");
        boolean paid = parseBooleanOrDefault(record, "paid", true);

        CategoryType categoryType = type == TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE;
        Category category = categoryRepository.findByNameAndType(categoryName, categoryType)
                .orElseGet(() -> {
                    Category c = new Category();
                    c.setName(categoryName);
                    c.setType(categoryType);
                    return categoryRepository.save(c);
                });

        Transaction transaction = new Transaction();
        transaction.setType(type);
        transaction.setCategory(category);
        transaction.setAmount(amount);
        transaction.setDescription(description);
        transaction.setTransactionDate(date);
        transaction.setFixed(fixed);
        transaction.setPaid(paid);
        return transaction;
    }

    private boolean parseBoolean(CSVRecord record, String column) {
        return parseBooleanOrDefault(record, column, false);
    }

    private boolean parseBooleanOrDefault(CSVRecord record, String column, boolean defaultValue) {
        if (!record.isMapped(column)) {
            return defaultValue;
        }
        String value = record.get(column);
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return Boolean.parseBoolean(value.trim());
    }
}
