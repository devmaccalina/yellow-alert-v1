package com.rif.backend.RiskFormsUser;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class ReportDTO {
    private Long id;
    private List<RiskFormDataDTO> riskFormData;
        private String status;
    private String approverComment;
    private LocalDate approverApproveDate;


    public ReportDTO(Report report) {
        this.id = report.getId();
        this.riskFormData = report.getRiskFormData().stream()   
                                  .map(RiskFormDataDTO::new)
                                  .collect(Collectors.toList());
        this.status = report.getStatus().name();
        this.approverComment = report.getApproverComment();
                this.approverApproveDate = report.getApproverApproveDate(); 
    }
    

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<RiskFormDataDTO> getRiskFormData() {
        return riskFormData;
    }

    public void setRiskFormData(List<RiskFormDataDTO> riskFormData) {
        this.riskFormData = riskFormData;
    }

      public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getApproverComment() {
        return approverComment;
    }

    public void setApproverComment(String approverComment) {
        this.approverComment = approverComment;
    }
  public LocalDate getApproverApproveDate() {
        return approverApproveDate;
    }

    public void setApproverApproveDate(LocalDate approverApproveDate) {
        this.approverApproveDate = approverApproveDate;
    }
    public static class RiskFormDataDTO {
        private Long id;
        private Integer sdaNumber;
        private String uploadRIF;
        private String issueParticulars;
        private String issueType;
        private Integer riskSEV;
        private Integer riskPROB;
        private String riskLevel;
        private String riskType;
        private String date;
        private Integer riskRating;
        private String status;
        private String submissionDate;
        private byte[] pdfProof;
        private String notes;
        private List<OpportunityDTO> opportunities;
        private List<ActionPlanDTO> actionPlans;
        private List<RiskParticularDTO> riskParticulars;
        private List<ResponsiblePersonDTO> responsiblePersons;

        public RiskFormDataDTO(RiskFormData riskFormData) {
            this.id = riskFormData.getId();
            this.sdaNumber = riskFormData.getSdaNumber();
            this.uploadRIF = riskFormData.getUploadRIF();
            this.issueParticulars = riskFormData.getIssueParticulars();
            this.issueType = riskFormData.getIssueType();
            this.riskSEV = riskFormData.getRiskSEV();
            this.riskPROB = riskFormData.getRiskPROB();
            this.riskLevel = riskFormData.getRiskLevel();
            this.riskType = riskFormData.getRiskType();
            this.date = riskFormData.getDate();
            this.riskRating = riskFormData.getRiskRating();
            this.status = riskFormData.getStatus();
            this.submissionDate = riskFormData.getSubmissionDate();
            this.pdfProof = riskFormData.getPdfProof();
            this.notes = riskFormData.getNotes();
            this.opportunities = riskFormData.getOpportunities().stream().map(OpportunityDTO::new).collect(Collectors.toList());
            this.actionPlans = riskFormData.getActionPlans().stream().map(ActionPlanDTO::new).collect(Collectors.toList());
            this.riskParticulars = riskFormData.getRiskParticulars().stream().map(RiskParticularDTO::new).collect(Collectors.toList());
            this.responsiblePersons = riskFormData.getResponsiblePersons().stream().map(ResponsiblePersonDTO::new).collect(Collectors.toList());
        }

        // Getters and Setters

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Integer getSdaNumber() {
            return sdaNumber;
        }

        public void setSdaNumber(Integer sdaNumber) {
            this.sdaNumber = sdaNumber;
        }

        public String getUploadRIF() {
            return uploadRIF;
        }

        public void setUploadRIF(String uploadRIF) {
            this.uploadRIF = uploadRIF;
        }

        public String getIssueParticulars() {
            return issueParticulars;
        }

        public void setIssueParticulars(String issueParticulars) {
            this.issueParticulars = issueParticulars;
        }

        public String getIssueType() {
            return issueType;
        }

        public void setIssueType(String issueType) {
            this.issueType = issueType;
        }

        public Integer getRiskSEV() {
            return riskSEV;
        }

        public void setRiskSEV(Integer riskSEV) {
            this.riskSEV = riskSEV;
        }

        public Integer getRiskPROB() {
            return riskPROB;
        }

        public void setRiskPROB(Integer riskPROB) {
            this.riskPROB = riskPROB;
        }

        public String getRiskLevel() {
            return riskLevel;
        }

        public void setRiskLevel(String riskLevel) {
            this.riskLevel = riskLevel;
        }

        public String getRiskType() {
            return riskType;
        }

        public void setRiskType(String riskType) {
            this.riskType = riskType;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public Integer getRiskRating() {
            return riskRating;
        }

        public void setRiskRating(Integer riskRating) {
            this.riskRating = riskRating;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getSubmissionDate() {
            return submissionDate;
        }

        public void setSubmissionDate(String submissionDate) {
            this.submissionDate = submissionDate;
        }

        public byte[] getPdfProof() {
            return pdfProof;
        }

        public void setPdfProof(byte[] pdfProof) {
            this.pdfProof = pdfProof;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }

        public List<OpportunityDTO> getOpportunities() {
            return opportunities;
        }

        public void setOpportunities(List<OpportunityDTO> opportunities) {
            this.opportunities = opportunities;
        }

        public List<ActionPlanDTO> getActionPlans() {
            return actionPlans;
        }

        public void setActionPlans(List<ActionPlanDTO> actionPlans) {
            this.actionPlans = actionPlans;
        }

        public List<RiskParticularDTO> getRiskParticulars() {
            return riskParticulars;
        }

        public void setRiskParticulars(List<RiskParticularDTO> riskParticulars) {
            this.riskParticulars = riskParticulars;
        }

        public List<ResponsiblePersonDTO> getResponsiblePersons() {
            return responsiblePersons;
        }

        public void setResponsiblePersons(List<ResponsiblePersonDTO> responsiblePersons) {
            this.responsiblePersons = responsiblePersons;
        }
    }

    public static class OpportunityDTO {
        private String description;

        public OpportunityDTO(Opportunity opportunity) {
            this.description = opportunity.getDescription();
        }

        // Getters and Setters

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    public static class ActionPlanDTO {
        private String description;

        public ActionPlanDTO(ActionPlan actionPlan) {
            this.description = actionPlan.getDescription();
        }

        // Getters and Setters

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    public static class RiskParticularDTO {
        private String description;

        public RiskParticularDTO(RiskParticular riskParticular) {
            this.description = riskParticular.getDescription();
        }

        // Getters and Setters

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    public static class ResponsiblePersonDTO {
        private String name;

        public ResponsiblePersonDTO(ResponsiblePerson responsiblePerson) {
            this.name = responsiblePerson.getName();
        }

        // Getters and Setters

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
