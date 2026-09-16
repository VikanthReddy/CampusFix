package app.service;

import org.springframework.stereotype.Service;

@Service
public class AIComplaintService {

    // =====================================================
    // COMPLAINT CATEGORY
    // =====================================================

    public String categorizeComplaint(
            String title,
            String description) {

        String text =
                ((title == null ? "" : title) + " "
                        + (description == null ? "" : description))
                        .toLowerCase();

        // -------------------------------------------------
        // ELECTRICAL
        // -------------------------------------------------

        if (containsAny(
                text,
                "electric",
                "electricity",
                "current",
                "power",
                "switch",
                "socket",
                "plug",
                "wire",
                "wiring",
                "fan",
                "light",
                "bulb",
                "tube light",
                "ac",
                "air conditioner"
        )) {
            return "ELECTRICAL";
        }

        // -------------------------------------------------
        // PLUMBING
        // -------------------------------------------------

        if (containsAny(
                text,
                "water",
                "tap",
                "pipe",
                "plumbing",
                "leak",
                "leakage",
                "washroom",
                "toilet",
                "sink",
                "drain",
                "flush"
        )) {
            return "PLUMBING";
        }

        // -------------------------------------------------
        // NETWORK
        // -------------------------------------------------

        if (containsAny(
                text,
                "wifi",
                "wi-fi",
                "internet",
                "network",
                "router",
                "ethernet",
                "lan",
                "connection",
                "connectivity"
        )) {
            return "NETWORK";
        }

        // -------------------------------------------------
        // FURNITURE
        // -------------------------------------------------

        if (containsAny(
                text,
                "chair",
                "desk",
                "table",
                "bench",
                "furniture",
                "door",
                "window",
                "cupboard",
                "drawer",
                "broken seat"
        )) {
            return "FURNITURE";
        }

        // -------------------------------------------------
        // CIVIL
        // -------------------------------------------------

        if (containsAny(
                text,
                "wall",
                "floor",
                "ceiling",
                "roof",
                "building",
                "crack",
                "paint",
                "construction",
                "road",
                "pothole",
                "civil"
        )) {
            return "CIVIL";
        }

        // -------------------------------------------------
        // GENERAL MAINTENANCE
        // -------------------------------------------------

        if (containsAny(
                text,
                "cleaning",
                "clean",
                "garbage",
                "dust",
                "maintenance",
                "repair",
                "campus",
                "classroom",
                "laboratory",
                "lab"
        )) {
            return "GENERAL MAINTENANCE";
        }

        return "GENERAL";
    }

    // =====================================================
    // COMPLAINT PRIORITY
    // =====================================================

    public String determinePriority(
            String title,
            String description) {

        String text =
                ((title == null ? "" : title) + " "
                        + (description == null ? "" : description))
                        .toLowerCase();

        // -------------------------------------------------
        // HIGH PRIORITY
        // -------------------------------------------------

        if (containsAny(
                text,
                "fire",
                "smoke",
                "shock",
                "electric shock",
                "danger",
                "dangerous",
                "emergency",
                "short circuit",
                "sparking",
                "spark",
                "flood",
                "major leakage",
                "security"
        )) {
            return "HIGH";
        }

        // -------------------------------------------------
        // MEDIUM PRIORITY
        // -------------------------------------------------

        if (containsAny(
                text,
                "not working",
                "broken",
                "damaged",
                "leak",
                "slow",
                "problem",
                "issue",
                "repair"
        )) {
            return "MEDIUM";
        }

        // -------------------------------------------------
        // LOW PRIORITY
        // -------------------------------------------------

        return "LOW";
    }

    // =====================================================
    // KEYWORD MATCHING
    // =====================================================

    private boolean containsAny(
            String text,
            String... keywords) {

        for (String keyword : keywords) {

            if (text.contains(
                    keyword.toLowerCase()
            )) {
                return true;
            }
        }

        return false;
    }
}