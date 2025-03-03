package com.rif.backend.RiskFormsUser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.rif.backend.Auth.User;
import com.rif.backend.Esignature.ESignature;
import com.rif.backend.Esignature.ESignatureService;
import com.rif.backend.Prerequisites.Prerequisite;
import com.rif.backend.Prerequisites.PrerequisiteService;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/riskforms")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private ReportRepository reportRepository;

     @Autowired
    private RevisionCommentHistoryService revisionCommentHistoryService;


    @Autowired
    private ESignatureService eSignatureService;

    @Autowired
    private PrerequisiteService prerequisiteService;

    @GetMapping("/unitType/{unitType}")
    public ResponseEntity<List<ReportDTO>> getReportsByUnitType(@PathVariable String unitType) {
        List<Report> reports = reportService.getReportsByUnitType(unitType);
        List<ReportDTO> reportDTOs = reports.stream()
                                             .map(ReportDTO::new)
                                             .collect(Collectors.toList());
        return ResponseEntity.ok(reportDTOs);
    }

 @GetMapping("/unitTypeCount/{unitType}")
public ResponseEntity<Long> getReportCountByUnitType(@PathVariable String unitType) {
    long count = reportService.getReportCountByUnitType(unitType);
    return ResponseEntity.ok(count);
}

@GetMapping("/unitTypeCount/{unitType}/dateRange")
public ResponseEntity<Long> getReportCountByUnitTypeAndDateRange(@PathVariable String unitType,
                                                                 @RequestParam String startDate,
                                                                 @RequestParam String endDate) {
    long count = reportService.getReportCountByUnitTypeAndDateRange(unitType, startDate, endDate);
    return ResponseEntity.ok(count);
}

    @GetMapping("/all-reports")
    public ResponseEntity<List<ReportDTO>> getAllReports() {
        List<Report> reports = reportRepository.findAllApprovedReports();
        List<ReportDTO> reportDTOs = reports.stream().map(ReportDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(reportDTOs);
    }

    @GetMapping("/unit/{unit}/email/{email}")
    public ResponseEntity<List<ReportDTO>> getReportsByUserUnitOrApproverUnit(@PathVariable String unit, @PathVariable String email) {
        List<Report> reports = reportService.getReportsByUserUnitOrApproverUnit(unit, email);
        List<ReportDTO> reportDTOs = reports.stream()
                                             .map(ReportDTO::new)
                                             .collect(Collectors.toList());
        return ResponseEntity.ok(reportDTOs);
    }

    @GetMapping("/reportDetails/{reportId}")
    public ResponseEntity<ReportDetailsDTO> getReportWithDetails(@PathVariable Long reportId) {
        Report report = reportService.findById(reportId).orElseThrow(() -> new RuntimeException("Report not found"));
        Prerequisite prerequisite = prerequisiteService.getPrerequisiteByUserId(report.getUser().getId()).orElse(null);
        User user = report.getUser();
        ESignature esignature = eSignatureService.getESignatureByUserId(user.getId()).orElse(null);

        if (esignature == null) {
            return ResponseEntity.notFound().build();
        }

        ReportDetailsDTO reportDetails = new ReportDetailsDTO(report, prerequisite, user, esignature);
        return ResponseEntity.ok(reportDetails);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateProofAndNotes(
        @RequestParam("reportId") Long reportId,
        @RequestParam(value = "pdfProofs", required = false) List<MultipartFile> pdfProofs,
        @RequestParam(value = "notes", required = false) List<String> notes) {

        try {
            reportService.updateProofAndNotes(reportId, pdfProofs, notes);
            return ResponseEntity.ok("Proof and notes updated successfully");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to update proof and notes: " + e.getMessage());
        }
    }

    @GetMapping("/report/{reportId}/pdf/{riskFormDataId}")
    public ResponseEntity<byte[]> getPdfProof(@PathVariable Long reportId, @PathVariable Long riskFormDataId) {
        Optional<byte[]> pdfProof = reportService.getPdfProof(reportId, riskFormDataId);
        if (pdfProof.isPresent()) {
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"proof.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfProof.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/approve")
    public ResponseEntity<Map<String, String>> approveReport(@RequestBody Map<String, Long> request) {
        Long reportId = request.get("reportId");
        reportService.approveReport(reportId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Report approved successfully");
        return ResponseEntity.ok(response);
    }

       @PostMapping("/for-revision")
    public ResponseEntity<Map<String, String>> markReportForRevision(@RequestBody Map<String, Object> request) {
        Long reportId = ((Number) request.get("reportId")).longValue();
        String comment = (String) request.get("comment");
        reportService.markReportForRevision(reportId, comment);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Report marked for revision with comment");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyReport(@RequestBody Map<String, Long> request) {
        Long reportId = request.get("reportId");
        reportService.verifyReport(reportId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Report verified successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/approverDetails/{reportId}")
    public ResponseEntity<ApproverDetailsDTO> getApproverDetails(@PathVariable Long reportId) {
        ApproverDetailsDTO approverDetails = reportService.getApproverDetails(reportId);
        return ResponseEntity.ok(approverDetails);
    }

    @PostMapping("/admin-verify")
    public ResponseEntity<Map<String, String>> adminVerifyReport(@RequestBody Map<String, Long> request) {
        Long reportId = request.get("reportId");
        reportService.adminVerifyReport(reportId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Report verified by admin successfully");
        return ResponseEntity.ok(response);
    }

     @PostMapping("/admin-for-revision")
    public ResponseEntity<Map<String, String>> adminMarkReportForRevision(@RequestBody Map<String, Object> request) {
        Long reportId = ((Number) request.get("reportId")).longValue();
        String comment = (String) request.get("comment");
        reportService.adminMarkReportForRevision(reportId, comment);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Report marked for revision by admin with comment");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/duplicate/{reportId}")
    public ResponseEntity<ReportDTO> duplicateReport(@PathVariable Long reportId) {
        Report duplicatedReport = reportService.duplicateReport(reportId);
        ReportDTO reportDTO = new ReportDTO(duplicatedReport);
        return ResponseEntity.ok(reportDTO);
    }
   @GetMapping("/revision-comments/{reportId}")
    public ResponseEntity<List<RevisionCommentHistoryDTO>> getRevisionComments(@PathVariable Long reportId) {
        List<RevisionCommentHistoryDTO> revisionComments = revisionCommentHistoryService.getRevisionCommentsByReportId(reportId);
        return ResponseEntity.ok(revisionComments);
    }
       @GetMapping("/admin-comment/{reportId}")
    public ResponseEntity<Map<String, String>> getAdminComment(@PathVariable Long reportId) {
        Optional<Report> reportOpt = reportService.findById(reportId);
        if (reportOpt.isPresent()) {
            Report report = reportOpt.get();
            Map<String, String> response = new HashMap<>();
            response.put("adminComment", report.getAdminComment());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", "Report not found"));
        }
    }

}
