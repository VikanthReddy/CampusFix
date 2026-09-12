package app.service;

import org.springframework.stereotype.Service;

@Service
public class PasswordHash {

    private static final long PRIME = 31;
    private static final long MODULUS = 1_000_000_007L;

    public String manualHash(String password) {

        long hashValue = 7;

        for (char c : password.toCharArray()) {
            hashValue =
                    (hashValue * PRIME + c) % MODULUS;
        }

        return Long.toHexString(hashValue);
    }
}