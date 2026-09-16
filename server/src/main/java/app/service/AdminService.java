package app.service;

import app.model.Complaint;
import app.model.Technician;
import app.model.User;
import app.repository.ComplaintRepository;
import app.repository.TechnicianRepository;
import app.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final ComplaintRepository complaintRepository;
    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AdminService(
            ComplaintRepository complaintRepository,
            TechnicianRepository technicianRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.complaintRepository = complaintRepository;
        this.technicianRepository = technicianRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // GET ALL COMPLAINTS
    // =========================================================

    public List<Complaint> getAllComplaints() {

        return complaintRepository.findAll();
    }

    // =========================================================
    // UPDATE COMPLAINT STATUS
    // =========================================================

    public Complaint updateComplaintStatus(
            Long complaintId,
            String status) {

        Complaint complaint =
                complaintRepository
                        .findById(complaintId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Complaint not found"
                                )
                        );

        // -----------------------------------------------------
        // VALIDATE STATUS
        // -----------------------------------------------------

        if (status == null
                || status.trim().isEmpty()) {

            throw new RuntimeException(
                    "Status is required"
            );
        }

        String normalizedStatus =
                status.trim().toUpperCase();

        if (!"PENDING".equals(normalizedStatus)
                && !"IN_PROGRESS".equals(normalizedStatus)
                && !"RESOLVED".equals(normalizedStatus)) {

            throw new RuntimeException(
                    "Invalid complaint status"
            );
        }

        String oldStatus =
                complaint.getStatus();

        complaint.setStatus(
                normalizedStatus
        );

        Complaint savedComplaint =
                complaintRepository.save(
                        complaint
                );

        // =====================================================
        // NOTIFY STUDENT
        // =====================================================

        if (complaint.getUser() != null
                && !normalizedStatus.equals(oldStatus)) {

            String message;

            if ("PENDING".equals(normalizedStatus)) {

                message =
                        "Your complaint #"
                                + complaint.getId()
                                + " is now pending.";

            } else if ("IN_PROGRESS".equals(
                    normalizedStatus)) {

                message =
                        "Your complaint #"
                                + complaint.getId()
                                + " is now in progress.";

            } else {

                message =
                        "Your complaint #"
                                + complaint.getId()
                                + " has been resolved.";
            }

            String notificationType;

            if ("RESOLVED".equals(
                    normalizedStatus)) {

                notificationType =
                        "COMPLAINT_RESOLVED";

            } else {

                notificationType =
                        "COMPLAINT_STATUS_UPDATED";
            }

            notificationService.createNotification(
                    complaint.getUser().getId(),
                    message,
                    notificationType
            );
        }

        // =====================================================
        // NOTIFY ASSIGNED TECHNICIAN
        // =====================================================

        if (complaint.getTechnician() != null
                && !normalizedStatus.equals(oldStatus)) {

            Technician technician =
                    complaint.getTechnician();

            User technicianUser =
                    userRepository
                            .findByEmail(
                                    technician.getEmail()
                            )
                            .orElse(null);

            if (technicianUser != null
                    && "ACTIVE".equals(
                            technicianUser
                                    .getAccountStatus()
                    )) {

                notificationService.createNotification(
                        technicianUser.getId(),

                        "Complaint #"
                                + complaint.getId()
                                + " status changed to "
                                + normalizedStatus
                                + ".",

                        "COMPLAINT_STATUS_UPDATED"
                );
            }
        }

        return savedComplaint;
    }

    // =========================================================
    // BACKWARD COMPATIBILITY
    // =========================================================
    // If any old class still calls updateStatus(),
    // it will continue to work.

    public Complaint updateStatus(
            Long complaintId,
            String status) {

        return updateComplaintStatus(
                complaintId,
                status
        );
    }

    // =========================================================
    // ASSIGN TECHNICIAN
    // =========================================================

    public Complaint assignTechnician(
            Long complaintId,
            Long technicianId) {

        // -----------------------------------------------------
        // FIND COMPLAINT
        // -----------------------------------------------------

        Complaint complaint =
                complaintRepository
                        .findById(complaintId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Complaint not found"
                                )
                        );

        // -----------------------------------------------------
        // FIND TECHNICIAN
        // -----------------------------------------------------

        Technician technician =
                technicianRepository
                        .findById(technicianId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Technician not found"
                                )
                        );

        // -----------------------------------------------------
        // CHECK AVAILABILITY
        // -----------------------------------------------------

        if (!technician.isAvailable()) {

            throw new RuntimeException(
                    "Technician is currently unavailable"
            );
        }

        // -----------------------------------------------------
        // COMPLAINT CATEGORY
        // -----------------------------------------------------

        String complaintCategory =
                complaint.getCategory() == null
                        ? "GENERAL"
                        : complaint.getCategory()
                                .trim()
                                .toUpperCase();

        // -----------------------------------------------------
        // TECHNICIAN SPECIALIZATION
        // -----------------------------------------------------

        String technicianSpecialization =
                technician.getSpecialization() == null
                        ? ""
                        : technician.getSpecialization()
                                .trim()
                                .toUpperCase();

        // =====================================================
        // CHECK SPECIALIZATION MATCH
        // =====================================================

        boolean specializationMatches;

        // GENERAL complaint
        if ("GENERAL".equals(
                complaintCategory)) {

            specializationMatches =
                    "GENERAL".equals(
                            technicianSpecialization
                    )
                    ||
                    "GENERAL MAINTENANCE".equals(
                            technicianSpecialization
                    );

        // GENERAL MAINTENANCE complaint
        } else if ("GENERAL MAINTENANCE".equals(
                complaintCategory)) {

            specializationMatches =
                    "GENERAL".equals(
                            technicianSpecialization
                    )
                    ||
                    "GENERAL MAINTENANCE".equals(
                            technicianSpecialization
                    );

        // Specific specialization
        } else {

            specializationMatches =
                    complaintCategory.equals(
                            technicianSpecialization
                    );
        }

        // -----------------------------------------------------
        // WRONG SPECIALIZATION
        // -----------------------------------------------------

        if (!specializationMatches) {

            throw new RuntimeException(
                    "Technician specialization does not match complaint category"
            );
        }

        // =====================================================
        // ASSIGN TECHNICIAN
        // =====================================================

        complaint.setTechnician(
                technician
        );

        // Automatically move complaint to IN_PROGRESS
        complaint.setStatus(
                "IN_PROGRESS"
        );

        Complaint savedComplaint =
                complaintRepository.save(
                        complaint
                );

        // =====================================================
        // FIND TECHNICIAN USER ACCOUNT
        // =====================================================

        User technicianUser =
                userRepository
                        .findByEmail(
                                technician.getEmail()
                        )
                        .orElse(null);

        // =====================================================
        // NOTIFY TECHNICIAN
        // =====================================================

        if (technicianUser != null
                && "ACTIVE".equals(
                        technicianUser
                                .getAccountStatus()
                )) {

            notificationService.createNotification(

                    technicianUser.getId(),

                    "A new complaint has been assigned to you: "
                            + complaint.getTitle(),

                    "COMPLAINT_ASSIGNED"
            );
        }

        // =====================================================
        // NOTIFY STUDENT
        // =====================================================

        if (complaint.getUser() != null) {

            notificationService.createNotification(

                    complaint.getUser().getId(),

                    "Technician "
                            + technician.getName()
                            + " has been assigned to your complaint #"
                            + complaint.getId()
                            + ".",

                    "TECHNICIAN_ASSIGNED"
            );
        }

        return savedComplaint;
    }
}