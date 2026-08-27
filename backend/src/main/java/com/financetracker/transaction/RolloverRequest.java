package com.financetracker.transaction;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RolloverRequest(
        @NotNull Integer fromYear,
        @NotNull @Min(1) @Max(12) Integer fromMonth,
        @NotNull Integer toYear,
        @NotNull @Min(1) @Max(12) Integer toMonth
) {
}
