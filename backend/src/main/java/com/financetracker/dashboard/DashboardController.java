package com.financetracker.dashboard;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public MonthSummaryDto summary(@RequestParam int year, @RequestParam int month) {
        return dashboardService.summary(year, month);
    }

    @GetMapping("/trend")
    public List<TrendPointDto> trend(@RequestParam(defaultValue = "6") int months,
                                      @RequestParam(required = false) Integer endYear,
                                      @RequestParam(required = false) Integer endMonth) {
        YearMonth to = (endYear != null && endMonth != null) ? YearMonth.of(endYear, endMonth) : YearMonth.now();
        YearMonth from = to.minusMonths(months - 1L);
        return dashboardService.trend(from, to);
    }
}
