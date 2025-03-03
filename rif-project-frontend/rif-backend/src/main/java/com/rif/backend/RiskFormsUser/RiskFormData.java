package com.rif.backend.RiskFormsUser;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "risk_forms")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class RiskFormData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer sdaNumber;
    private String uploadRIF;
    @Column(length = 10000)
    private String issueParticulars;
    private String issueType;
    private Integer riskSEV;
    private Integer riskPROB;
    private String riskLevel;
    private String riskType;
    private String date;
    private Integer riskRating;
    @Column(length = 10000)
    private String status;
    private String submissionDate;

    @Lob
    private byte[] pdfProof;

    @Column(length = 5000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    @JsonBackReference
    private Report report;

    @OneToMany(mappedBy = "riskFormData", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private Set<Opportunity> opportunities = new HashSet<>();

    @OneToMany(mappedBy = "riskFormData", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private Set<ActionPlan> actionPlans = new HashSet<>();

    @OneToMany(mappedBy = "riskFormData", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private Set<RiskParticular> riskParticulars = new HashSet<>();

    @OneToMany(mappedBy = "riskFormData", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private Set<ResponsiblePerson> responsiblePersons = new HashSet<>();

    @Transient
    private Set<String> responsiblePersonNames = new HashSet<>();

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

    public Report getReport() {
        return report;
    }

    public void setReport(Report report) {
        this.report = report;
    }

    public Set<Opportunity> getOpportunities() {
        return opportunities;
    }

    public void setOpportunities(Set<Opportunity> opportunities) {
        this.opportunities = opportunities;
    }

    public Set<ActionPlan> getActionPlans() {
        return actionPlans;
    }

    public void setActionPlans(Set<ActionPlan> actionPlans) {
        this.actionPlans = actionPlans;
    }

    public Set<RiskParticular> getRiskParticulars() {
        return riskParticulars;
    }

    public void setRiskParticulars(Set<RiskParticular> riskParticulars) {
        this.riskParticulars = riskParticulars;
    }

    public Set<ResponsiblePerson> getResponsiblePersons() {
        return responsiblePersons;
    }

    public void setResponsiblePersons(Set<ResponsiblePerson> responsiblePersons) {
        this.responsiblePersons = responsiblePersons;
    }

    public Set<String> getResponsiblePersonNames() {
        return responsiblePersonNames;
    }

    public void setResponsiblePersonNames(Set<String> responsiblePersonNames) {
        this.responsiblePersonNames = responsiblePersonNames;
    }

    public void convertNamesToResponsiblePersons() {
        this.responsiblePersons = this.responsiblePersonNames.stream()
            .map(name -> new ResponsiblePerson(name, this))
            .collect(Collectors.toSet());
    }


public void updateFields(RiskFormData newData) {
    this.sdaNumber = newData.getSdaNumber();
    this.uploadRIF = newData.getUploadRIF();
    this.issueParticulars = newData.getIssueParticulars();
    this.issueType = newData.getIssueType();
    this.riskSEV = newData.getRiskSEV();
    this.riskPROB = newData.getRiskPROB();
    this.riskLevel = newData.getRiskLevel();
    this.riskType = newData.getRiskType();
    this.date = newData.getDate();
    this.riskRating = newData.getRiskRating();
    this.status = newData.getStatus();
    this.submissionDate = newData.getSubmissionDate();
    this.pdfProof = newData.getPdfProof();
    this.notes = newData.getNotes();

    // Update opportunities
    this.opportunities.clear();
    this.opportunities.addAll(newData.getOpportunities());

    // Update action plans
    this.actionPlans.clear();
    this.actionPlans.addAll(newData.getActionPlans());

    // Update risk particulars
    this.riskParticulars.clear();
    this.riskParticulars.addAll(newData.getRiskParticulars());

    // Update responsible persons
    this.responsiblePersons.clear();
    this.responsiblePersons.addAll(newData.getResponsiblePersons());
}


}
