package com.rif.backend.RiskFormsUser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/riskforms")
public class RiskFormController {

    @Autowired
    private RiskFormService riskFormService;

    @Autowired
    private ReportRepository reportRepository;
    @Autowired
    private RiskFormRepository riskFormRepository;

    @PostMapping("/submit")
    public ResponseEntity<?> submitRiskForm(@RequestBody List<RiskFormData> formDataList) {
        try {
            riskFormService.saveRiskFormDataList(formDataList);
            return ResponseEntity.ok("Form submitted successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to submit the form: " + e.getMessage());
        }
    }

@GetMapping("/report/{id}")
public ResponseEntity<?> getReportById(@PathVariable Long id) {
    Optional<Report> report = reportRepository.findByIdWithRiskForms(id);
    if (report.isPresent()) {
        return ResponseEntity.ok(new ReportDTO(report.get()));
    } else {
        return ResponseEntity.notFound().build();
    }
}


    @GetMapping("/reports")
    public ResponseEntity<?> getReportsByUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Report> reports = reportRepository.findAllByUserEmail(email);
        List<ReportDTO> reportDTOs = reports.stream().map(ReportDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(reportDTOs);
    }

 @GetMapping("/groupedBySdaNumber")
public ResponseEntity<List<RiskFormDataGroupedDTO>> getRiskFormDataGroupedBySdaNumber(
    @RequestParam(required = false) String startDate,
    @RequestParam(required = false) String endDate,
    @RequestParam(required = false) Boolean sortUnitAsc
) {
    List<RiskFormDataGroupedDTO> groupedData = riskFormService.getRiskFormDataGroupedBySdaNumber();

    if (startDate != null && endDate != null) {
        groupedData = groupedData.stream()
            .filter(data -> data.getSubmissionDate().compareTo(startDate) >= 0 && data.getSubmissionDate().compareTo(endDate) <= 0)
            .collect(Collectors.toList());
    }

    if (sortUnitAsc != null) {
        groupedData.sort((a, b) -> sortUnitAsc ? a.getUnit().compareTo(b.getUnit()) : b.getUnit().compareTo(a.getUnit()));
    }

    return ResponseEntity.ok(groupedData);
}


@GetMapping("/dataBySdaNumber/{sdaNumber}")
public ResponseEntity<List<RiskFormDataCustomDTO>> getRiskFormDataBySdaNumber(@PathVariable Integer sdaNumber) {
    List<RiskFormDataCustomDTO> data = riskFormService.getRiskFormDataBySdaNumber(sdaNumber);
    return ResponseEntity.ok(data);
}

@GetMapping("/allData")
public ResponseEntity<List<PrerequisiteDataDTO>> getAllRiskFormData() {
    List<PrerequisiteDataDTO> data = riskFormService.getAllRiskFormData();
    return ResponseEntity.ok(data);
}

@PostMapping("/updateRiskFormData")
public ResponseEntity<?> updateRiskFormData(@RequestParam Long reportId, @RequestBody List<RiskFormData> formDataList) {
    try {
        Optional<Report> existingReport = reportRepository.findById(reportId);
        if (!existingReport.isPresent()) {
            return ResponseEntity.badRequest().body("Report not found with ID: " + reportId);
        }

        Report report = existingReport.get();
        // Set the report status to APPROVER_PENDING
        report.setStatus(Report.ReportStatus.APPROVER_PENDING);
        reportRepository.save(report); // Save the updated report with the new status
        System.out.println("Report status reset to APPROVER_PENDING");

        List<RiskFormData> existingRiskFormData = report.getRiskFormData();

        for (RiskFormData newData : formDataList) {
            if (newData.getId() != null) {
                Optional<RiskFormData> existingData = existingRiskFormData.stream()
                        .filter(data -> data.getId().equals(newData.getId()))
                        .findFirst();

                if (existingData.isPresent()) {
                    RiskFormData dataToUpdate = existingData.get();
                    dataToUpdate.updateFields(newData);
                    riskFormRepository.save(dataToUpdate);
                } else {
                    newData.setReport(report);
                    riskFormRepository.save(newData);
                }
            } else {
                newData.setReport(report);
                riskFormRepository.save(newData);
            }
        }

        existingRiskFormData.stream()
            .filter(existingData -> formDataList.stream().noneMatch(newData -> newData.getId().equals(existingData.getId())))
            .forEach(removedData -> riskFormRepository.delete(removedData));

        return ResponseEntity.ok("Risk form data updated successfully!");
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest().body("Failed to update risk form data: " + e.getMessage());
    }
}

@GetMapping("/dataByUserUnit")
public ResponseEntity<List<RiskFormDataCustomDTO>> getRiskFormDataByUserUnit(@RequestParam(required = false) Integer sdaNumber) {
    String userEmail = getCurrentUserEmail();
    List<RiskFormDataCustomDTO> data = riskFormService.getRiskFormDataByUserEmailAndSda(userEmail, sdaNumber);
    return ResponseEntity.ok(data);
}

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            return ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        return null;
    }
@GetMapping("/dataByApproverUnit")
public ResponseEntity<List<RiskFormDataCustomDTO>> getRiskFormDataByApproverUnit(
        @RequestParam(required = false) Integer sdaNumber) {
    String userEmail = getCurrentUserEmail();
    List<RiskFormDataCustomDTO> data = riskFormService.getRiskFormDataByApproverUnit(userEmail, sdaNumber);
    return ResponseEntity.ok(data);
}

@GetMapping("/dataByUserUnitForSDAComparison")
public ResponseEntity<List<PrerequisiteDataDTO>> getRiskFormDataByUserUnitForSDAComparison() {
    String userEmail = getCurrentUserEmail();
    List<PrerequisiteDataDTO> data = riskFormService.getRiskFormDataByUserEmailForSDAComparison(userEmail);
    return ResponseEntity.ok(data);
}

@GetMapping("/dataForApproverUnit")
public ResponseEntity<List<PrerequisiteDataDTO>> getRiskFormDataForApproverUnit() {
    String userEmail = getCurrentUserEmail();
    List<PrerequisiteDataDTO> data = riskFormService.getRiskFormDataForApproverUnit(userEmail);
    return ResponseEntity.ok(data);
}
}
