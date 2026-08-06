package com.smartshelfx.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private String username;
    private String email;
    private String fullName;
    private String role;
    private Long userId;
    private boolean authenticated;

    public AuthResponse(String token, String username, String email, String fullName, String role, Long userId) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.userId = userId;
        this.authenticated = true;
    }
}