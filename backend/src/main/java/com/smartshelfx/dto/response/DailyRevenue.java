package com.smartshelfx.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyRevenue {
    private String date;
    private BigDecimal revenue;
    private Long salesCount;
}