package app.controller;

import app.model.Complaint;
import app.model.Technician;
import app.service.AdminService;
import app.service.TechnicianService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;
    private final TechnicianService technicianService;

    public AdminController(
            AdminService adminService,
            TechnicianService technicianService) {

        this.adminService = adminService;
        this.technicianService = technicianService;
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getAllComplaints() {

        return ResponseEntity.ok(
                adminService.getAllComplaints()
        );
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                adminService.updateStatus(id, status)
        );
    }

    @PutMapping(
            "/complaints/{complaintId}/assign/{technicianId}"
    )
    public ResponseEntity<Complaint> assignTechnician(
            @PathVariable Long complaintId,
            @PathVariable Long technicianId) {

        return ResponseEntity.ok(
                adminService.assignTechnician(
                        complaintId,
                        technicianId
                )
        );
    }

    @PostMapping("/technicians")
    public ResponseEntity<Technician> createTechnician(
            @RequestBody Technician technician) {

        return ResponseEntity.ok(
                technicianService.createTechnician(
                        technician
                )
        );
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<Technician>>
    getTechnicians() {

        return ResponseEntity.ok(
                technicianService.getAllTechnicians()
        );
    }
}