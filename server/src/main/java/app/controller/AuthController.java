package app.controller;

import app.dto.LoginRequest;
import app.dto.SignupRequest;
import app.dto.UserResponse;
import app.model.User;
import app.service.AuthService;
import app.service.CustomUserDetailsService;
import app.service.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://campus-fix-smoky.vercel.app"
})
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            CustomUserDetailsService customUserDetailsService) {

        this.authService = authService;
        this.jwtService = jwtService;
        this.customUserDetailsService =
                customUserDetailsService;
    }

    // =====================================================
    // SIGNUP
    // =====================================================

    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @RequestBody SignupRequest request) {

        try {

            User user =
                    authService.signup(request);

            return ResponseEntity.ok(
                    new UserResponse(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getRole()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =====================================================
    // LOGIN
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        try {

            User user =
                    authService.login(request);

            // -------------------------------------------------
            // LOAD USER FOR SPRING SECURITY
            // -------------------------------------------------

            UserDetails userDetails =
                    customUserDetailsService
                            .loadUserByUsername(
                                    user.getEmail()
                            );

            // -------------------------------------------------
            // GENERATE JWT
            // -------------------------------------------------

            String token =
                    jwtService.generateToken(
                            userDetails,
                            user.getRole()
                    );

            // -------------------------------------------------
            // RETURN USER + TOKEN
            // -------------------------------------------------

            return ResponseEntity.ok(
                    new UserResponse(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getRole(),
                            token
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        try {
            authService.forgotPassword(request.get("email"));
            return ResponseEntity.ok(java.util.Map.of("message", "OTP sent successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request) {
        try {
            authService.resetPassword(request.get("email"), request.get("otp"), request.get("newPassword"));
            return ResponseEntity.ok(java.util.Map.of("message", "Password reset successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}