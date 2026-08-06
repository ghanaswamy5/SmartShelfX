package com.smartshelfx.controller;

import com.smartshelfx.ai.GeminiAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiAiService geminiAiService;

    @GetMapping("/forecast/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> getForecast(@PathVariable Long productId) {
        String result = geminiAiService.getDemandForecast(productId);
        Map<String, String> response = new HashMap<>();
        response.put("result", result);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recommendations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> getRecommendations() {
        String result = geminiAiService.getRecommendations();
        Map<String, String> response = new HashMap<>();
        response.put("result", result);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/movement-analysis")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> getMovementAnalysis() {
        String result = geminiAiService.getMovementAnalysis();
        Map<String, String> response = new HashMap<>();
        response.put("result", result);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/seasonal-prediction")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> getSeasonalPrediction() {
        String result = geminiAiService.getSeasonalPrediction();
        Map<String, String> response = new HashMap<>();
        response.put("result", result);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/purchase-suggestions")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> getPurchaseSuggestions() {
        String result = geminiAiService.getPurchaseSuggestions();
        Map<String, String> response = new HashMap<>();
        response.put("result", result);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Message is required");
            return ResponseEntity.badRequest().body(error);
        }

        String result = geminiAiService.chatWithAi(message);
        Map<String, String> response = new HashMap<>();
        response.put("result", result);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "AI Service is running");
        response.put("message", "Gemini AI integration is ready");
        return ResponseEntity.ok(response);
    }
}