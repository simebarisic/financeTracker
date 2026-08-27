package com.financetracker.transaction;

import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final TransactionRepository transactionRepository;
    private final CsvService csvService;

    public TransactionController(TransactionService transactionService,
                                  TransactionRepository transactionRepository,
                                  CsvService csvService) {
        this.transactionService = transactionService;
        this.transactionRepository = transactionRepository;
        this.csvService = csvService;
    }

    @GetMapping
    public List<TransactionDto> findForMonth(@RequestParam int year, @RequestParam int month) {
        return transactionService.findForMonth(year, month);
    }

    @PostMapping
    public ResponseEntity<TransactionDto> create(@Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDto> update(@PathVariable Long id, @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.update(id, request));
    }

    @PatchMapping("/{id}/paid")
    public ResponseEntity<TransactionDto> setPaid(@PathVariable Long id, @RequestBody PaidRequest request) {
        return ResponseEntity.ok(transactionService.setPaid(id, request.paid()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/rollover")
    public ResponseEntity<List<TransactionDto>> rollover(@Valid @RequestBody RolloverRequest request) {
        YearMonth from = YearMonth.of(request.fromYear(), request.fromMonth());
        YearMonth to = YearMonth.of(request.toYear(), request.toMonth());
        return ResponseEntity.ok(transactionService.rolloverFixedExpenses(from, to));
    }

    @GetMapping("/export")
    public ResponseEntity<String> export(@RequestParam int year, @RequestParam int month) {
        YearMonth ym = YearMonth.of(year, month);
        List<Transaction> transactions = transactionRepository
                .findAllByTransactionDateBetweenOrderByTransactionDateDescIdDesc(ym.atDay(1), ym.atEndOfMonth());
        String csv = csvService.export(transactions);

        String filename = "transactions-" + ym + ".csv";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename, StandardCharsets.UTF_8).build().toString())
                .body(csv);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CsvService.ImportResult> importCsv(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(csvService.importCsv(file));
    }
}
