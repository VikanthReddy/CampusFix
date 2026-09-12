package app.service;

import app.dto.LoginRequest;
import app.dto.SignupRequest;
import app.model.User;
import app.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordHash passwordHash;

    public AuthService(
            UserRepository userRepository,
            PasswordHash passwordHash) {

        this.userRepository = userRepository;
        this.passwordHash = passwordHash;
    }

    // =========================
    // SIGNUP
    // =========================
    public User signup(SignupRequest request) {

        // Check whether email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Hash password
        String hashedPassword =
                passwordHash.manualHash(request.getPassword());

        user.setPassword(hashedPassword);

        // Role
        String role = request.getRole();

        if (role == null || role.trim().isEmpty()) {
            role = "STUDENT";
        }

        user.setRole(role.toUpperCase());

        return userRepository.save(user);
    }


    // =========================
    // LOGIN
    // =========================
    public User login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );

        // Hash entered password
        String hashedPassword =
                passwordHash.manualHash(request.getPassword());

        // Compare hashed passwords
        if (!user.getPassword().equals(hashedPassword)) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }
}