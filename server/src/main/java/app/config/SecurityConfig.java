package app.config;

import app.service.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    // ==========================================
    // PASSWORD ENCODER
    // ==========================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // ==========================================
    // SECURITY FILTER CHAIN
    // ==========================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            // ------------------------------------------
            // CSRF
            // ------------------------------------------

            .csrf()
                .disable()

            // ------------------------------------------
            // SESSION
            // ------------------------------------------

            .sessionManagement()
                .sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS
                )
                .and()

            // ------------------------------------------
            // AUTHORIZATION
            // ------------------------------------------

            .authorizeRequests()

                // Public authentication APIs
                .antMatchers(
                        "/api/auth/**"
                )
                .permitAll()

                // Uploaded complaint images
                .antMatchers(
                        "/uploads/**"
                )
                .permitAll()

                // CORS preflight
                .antMatchers(
                        HttpMethod.OPTIONS,
                        "/**"
                )
                .permitAll()

                // Admin APIs
                .antMatchers(
                        "/api/admin/**"
                )
                .hasRole("ADMIN")

                // Analytics
                .antMatchers(
                        "/api/analytics/**"
                )
                .hasRole("ADMIN")

                // Notifications
                .antMatchers(
                        "/api/notifications/**"
                )
                .authenticated()

                // Complaints
                .antMatchers(
                        "/api/complaints/**"
                )
                .authenticated()

                // Technician endpoints are intentionally
                // NOT globally restricted here.
                //
                // TechnicianController uses @PreAuthorize
                // so ADMIN and TECHNICIAN can access the
                // correct endpoints individually.
                
                .anyRequest()
                .authenticated();

        // ------------------------------------------
        // JWT FILTER
        // ------------------------------------------

        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }
}