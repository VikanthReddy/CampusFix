package app.service;

import app.dto.AnalyticsResponse;
import app.repository.ComplaintRepository;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final ComplaintRepository complaintRepository;

    public AnalyticsService(
            ComplaintRepository complaintRepository) {

        this.complaintRepository = complaintRepository;
    }

    public AnalyticsResponse getSummary() {

        long total =
                complaintRepository.count();

        long pending =
                complaintRepository.countByStatus("PENDING");

        long inProgress =
                complaintRepository.countByStatus("IN_PROGRESS");

        long resolved =
                complaintRepository.countByStatus("RESOLVED");

        long electrical =
                complaintRepository
                        .countByCategory("ELECTRICAL");

        long plumbing =
                complaintRepository
                        .countByCategory("PLUMBING");

        long network =
                complaintRepository
                        .countByCategory("NETWORK");

        long furniture =
                complaintRepository
                        .countByCategory("FURNITURE");

        long general =
                complaintRepository
                        .countByCategory("GENERAL");

        return new AnalyticsResponse(
                total,
                pending,
                inProgress,
                resolved,
                electrical,
                plumbing,
                network,
                furniture,
                general
        );
    }
}