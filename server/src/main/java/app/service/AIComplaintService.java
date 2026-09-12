package app.service;

import org.springframework.stereotype.Service;

@Service
public class AIComplaintService {

    public String categorizeComplaint(
            String title,
            String description) {

        String text =
                (title + " " + description).toLowerCase();

        if (containsAny(text,
                "wifi",
                "internet",
                "network",
                "router",
                "lan",
                "computer")) {

            return "NETWORK";
        }

        if (containsAny(text,
                "water",
                "tap",
                "pipe",
                "leak",
                "toilet",
                "washroom")) {

            return "PLUMBING";
        }

        if (containsAny(text,
                "fan",
                "light",
                "electric",
                "electricity",
                "switch",
                "power",
                "ac")) {

            return "ELECTRICAL";
        }

        if (containsAny(text,
                "chair",
                "bench",
                "desk",
                "table",
                "door",
                "window",
                "furniture")) {

            return "FURNITURE";
        }

        return "GENERAL";
    }

    public String determinePriority(
            String title,
            String description) {

        String text =
                (title + " " + description).toLowerCase();

        if (containsAny(text,
                "fire",
                "danger",
                "emergency",
                "accident",
                "flood",
                "electric shock",
                "gas leak")) {

            return "CRITICAL";
        }

        if (containsAny(text,
                "not working",
                "broken",
                "leak",
                "urgent",
                "unsafe",
                "no internet",
                "power failure")) {

            return "HIGH";
        }

        if (containsAny(text,
                "slow",
                "minor",
                "damaged")) {

            return "LOW";
        }

        return "MEDIUM";
    }

    private boolean containsAny(
            String text,
            String... keywords) {

        for (String keyword : keywords) {

            if (text.contains(keyword)) {
                return true;
            }
        }

        return false;
    }
}