package com.smartshelfx.config;

import com.smartshelfx.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/health").permitAll()

                        // Product endpoints - Manager/Admin write, all read
                        .requestMatchers("/api/products").authenticated()
                        .requestMatchers("/api/products/{id}").authenticated()
                        .requestMatchers("/api/products/low-stock").authenticated()
                        .requestMatchers("/api/products/out-of-stock").authenticated()
                        .requestMatchers("/api/products/expiring").authenticated()
                        .requestMatchers("/api/products/category/**").authenticated()
                        .requestMatchers("/api/products/supplier/**").authenticated()
                        .requestMatchers("/api/products/search").authenticated()

                        // Product write operations - Manager/Admin only
                        .requestMatchers("/api/products").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/products/{id}").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/products/{id}/delete").hasRole("ADMIN")

                        // Category endpoints
                        .requestMatchers("/api/categories").authenticated()
                        .requestMatchers("/api/categories/**").authenticated()
                        .requestMatchers("/api/categories").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/categories/{id}/delete").hasRole("ADMIN")

                        // Supplier endpoints
                        .requestMatchers("/api/suppliers").authenticated()
                        .requestMatchers("/api/suppliers/**").authenticated()
                        .requestMatchers("/api/suppliers").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/suppliers/{id}/delete").hasRole("ADMIN")

                        // Sales endpoints
                        .requestMatchers("/api/sales").authenticated()
                        .requestMatchers("/api/sales/**").authenticated()

                        // Inventory endpoints
                        .requestMatchers("/api/inventory/movement").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/inventory/movements/**").authenticated()

                        // Dashboard - all authenticated
                        .requestMatchers("/api/dashboard/**").authenticated()

                        // AI endpoints - all authenticated
                        .requestMatchers("/api/ai/**").authenticated()

                        // Reports - all authenticated
                        .requestMatchers("/api/reports/**").authenticated()

                        // Notifications - all authenticated
                        .requestMatchers("/api/notifications/**").authenticated()

                        // Profile - all authenticated
                        .requestMatchers("/api/users/profile/**").authenticated()
                                // Reports
                                .requestMatchers("/api/reports/**").authenticated()
                                .requestMatchers("/api/reports/products/export").hasAnyRole("ADMIN", "MANAGER")
                                .requestMatchers("/api/reports/sales/export").hasAnyRole("ADMIN", "MANAGER")
                                .requestMatchers("/api/reports/low-stock/export").hasAnyRole("ADMIN", "MANAGER")
                                .requestMatchers("/api/reports/inventory/export/**").hasAnyRole("ADMIN", "MANAGER")

// Profile
                                .requestMatchers("/api/users/profile/**").authenticated()
                                .requestMatchers("/api/users/profile").hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE")
                                .requestMatchers("/api/users/profile/change-password").hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE")

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public CommandLineRunner testAuthentication(PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println("\n========== 🔐 AUTHENTICATION TEST ==========");

            String rawPassword = "password123";

            // Test password encoding
            String encoded = passwordEncoder.encode(rawPassword);
            System.out.println("✅ Password encoding test:");
            System.out.println("   Raw: " + rawPassword);
            System.out.println("   Encoded: " + encoded);
            System.out.println("   Matches: " + passwordEncoder.matches(rawPassword, encoded));

            // Test specific hashes from database
            String adminHash = "$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG";
            System.out.println("\n✅ Testing seed user passwords:");
            System.out.println("   Admin hash matches 'password123': " + passwordEncoder.matches("password123", adminHash));
            System.out.println("   Manager hash matches 'password123': " + passwordEncoder.matches("password123", adminHash));
            System.out.println("   Employee hash matches 'password123': " + passwordEncoder.matches("password123", adminHash));

            System.out.println("\n📝 Test Credentials:");
            System.out.println("   Admin:    admin / password123");
            System.out.println("   Manager:  manager / password123");
            System.out.println("   Employee: employee / password123");
            System.out.println("============================================\n");
        };
    }


}