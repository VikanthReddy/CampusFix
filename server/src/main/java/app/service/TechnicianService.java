package app.service;

import app.model.Complaint;
import app.model.Technician;
import app.repository.ComplaintRepository;
import app.repository.TechnicianRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TechnicianService {

    private final TechnicianRepository technicianRepository;
    private final ComplaintRepository complaintRepository;

    public TechnicianService(
            TechnicianRepository technicianRepository,
            ComplaintRepository complaintRepository) {

        this.technicianRepository = technicianRepository;
        this.complaintRepository = complaintRepository;
    }

    public Technician createTechnician(
            Technician technician) {

        if (technicianRepository
                .existsByEmail(technician.getEmail())) {

            throw new RuntimeException(
                    "Technician email already exists");
        }

        return technicianRepository.save(technician);
    }

    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    public Technician getTechnician(Long id) {

        return technicianRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Technician not found"));
    }

    public List<Complaint> getAssignedComplaints(Long technicianId) {

        Technician technician = getTechnician(technicianId);

        return complaintRepository
                .findByTechnician(technician);
    }

    public Complaint updateComplaintStatus(
            Long technicianId,
            Long complaintId,
            String status) {

        Technician technician = getTechnician(technicianId);

        Complaint complaint = complaintRepository
                .findById(complaintId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Complaint not found"));

        if (complaint.getTechnician() == null ||
                !complaint.getTechnician()
                        .getId()
                        .equals(technician.getId())) {

            throw new RuntimeException(
                    "Complaint is not assigned to this technician");
        }

        complaint.setStatus(status);

        return complaintRepository.save(complaint);
    }
}