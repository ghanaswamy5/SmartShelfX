package com.smartshelfx.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String link;
    private Boolean isRead;
    private LocalDateTime createdAt;
}