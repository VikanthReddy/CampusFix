package app.controller;

import app.dto.LoginRequest;
import app.dto.SignupRequest;
import app.model.User;
import app.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<User> signup(
            @RequestBody SignupRequest request) {

        return ResponseEntity.ok(
                authService.signup(request)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }
}