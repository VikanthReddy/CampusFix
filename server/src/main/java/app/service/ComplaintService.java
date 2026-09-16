package app.service;

import app.dto.ComplaintRequest;
import app.model.Complaint;
import app.model.User;
import app.repository.ComplaintRepository;
import app.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final AIComplaintService aiComplaintService;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            AIComplaintService aiComplaintService,
            FileStorageService fileStorageService,
            NotificationService notificationService) {

        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.aiComplaintService = aiComplaintService;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    // =========================================================
    // CREATE COMPLAINT
    // =========================================================

    public Complaint createComplaint(
            ComplaintRequest request,
            Long userId,
            MultipartFile image) {

        if (request == null) {
            throw new RuntimeException(
                    "Complaint request cannot be empty"
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (request.getTitle() == null
                || request.getTitle().trim().isEmpty()) {

            throw new RuntimeException(
                    "Complaint title is required"
            );
        }

        if (request.getDescription() == null
                || request.getDescription().trim().isEmpty()) {

            throw new RuntimeException(
                    "Complaint description is required"
            );
        }

        if (request.getLocation() == null
                || request.getLocation().trim().isEmpty()) {

            throw new RuntimeException(
                    "Complaint location is required"
            );
        }

        // -----------------------------------------------------
        // PHOTO IS COMPULSORY
        // -----------------------------------------------------

        if (image == null || image.isEmpty()) {

            throw new RuntimeException(
                    "Complaint photo is required"
            );
        }

        // -----------------------------------------------------
        // SAVE IMAGE
        // -----------------------------------------------------

        String imageUrl =
                fileStorageService.saveImage(image);

        // -----------------------------------------------------
        // CREATE COMPLAINT
        // -----------------------------------------------------

        Complaint complaint = new Complaint();

        complaint.setTitle(
                request.getTitle().trim()
        );

        complaint.setDescription(
                request.getDescription().trim()
        );

        complaint.setLocation(
                request.getLocation().trim()
        );

        complaint.setUser(user);

        // -----------------------------------------------------
        // CATEGORY
        // -----------------------------------------------------

        String category = request.getCategory();

        if (category == null
                || category.trim().isEmpty()) {

            category =
                    aiComplaintService.categorizeComplaint(
                            request.getTitle(),
                            request.getDescription()
                    );
        }

        if (category == null
                || category.trim().isEmpty()) {

            category = "GENERAL";
        }

        complaint.setCategory(
                category.trim().toUpperCase()
        );

        // -----------------------------------------------------
        // PRIORITY
        // -----------------------------------------------------

        String priority = request.getPriority();

        if (priority == null
                || priority.trim().isEmpty()) {

            priority =
                    aiComplaintService.determinePriority(
                            request.getTitle(),
                            request.getDescription()
                    );
        }

        if (priority == null
                || priority.trim().isEmpty()) {

            priority = "MEDIUM";
        }

        complaint.setPriority(
                priority.trim().toUpperCase()
        );

        // -----------------------------------------------------
        // IMAGE
        // -----------------------------------------------------

        complaint.setImageUrl(imageUrl);

        // -----------------------------------------------------
        // DEFAULT STATUS
        // -----------------------------------------------------

        complaint.setStatus("PENDING");

        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        Complaint savedComplaint =
                complaintRepository.save(complaint);

        // -----------------------------------------------------
        // NOTIFY ACTIVE ADMINS
        // -----------------------------------------------------

        List<User> activeAdmins =
                userRepository.findByRoleAndAccountStatus(
                        "ADMIN",
                        "ACTIVE"
                );

        for (User admin : activeAdmins) {

            notificationService.createNotification(
                    admin.getId(),
                    "New complaint submitted: "
                            + savedComplaint.getTitle(),
                    "NEW_COMPLAINT"
            );
        }

        return savedComplaint;
    }

    // =========================================================
    // GET STUDENT COMPLAINTS
    // =========================================================

    public List<Complaint> getUserComplaints(
            Long userId) {

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        return complaintRepository.findByUser(user);
    }

    // =========================================================
    // GET COMPLAINT
    // =========================================================

    public Complaint getComplaint(
            Long id) {

        return complaintRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Complaint not found"
                        )
                );
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    public Complaint updateComplaintStatus(
            Long id,
            String status) {

        Complaint complaint =
                getComplaint(id);

        if (status == null
                || status.trim().isEmpty()) {

            throw new RuntimeException(
                    "Status is required"
            );
        }

        String normalizedStatus =
                status.trim().toUpperCase();

        if (!normalizedStatus.equals("PENDING")
                && !normalizedStatus.equals("IN_PROGRESS")
                && !normalizedStatus.equals("RESOLVED")) {

            throw new RuntimeException(
                    "Invalid complaint status"
            );
        }

        complaint.setStatus(
                normalizedStatus
        );

        return complaintRepository.save(
                complaint
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    public void deleteComplaint(
            Long id) {

        if (!complaintRepository.existsById(id)) {

            throw new RuntimeException(
                    "Complaint not found"
            );
        }

        complaintRepository.deleteById(id);
    }
}