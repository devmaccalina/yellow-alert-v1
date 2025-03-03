package com.rif.backend.RiskFormsUser;

import com.rif.backend.Prerequisites.Prerequisite;
import com.rif.backend.Esignature.ESignature;
import com.rif.backend.Auth.User;

public class ReportDetailsDTO {
    private ReportDTO report;
    private Prerequisite prerequisite;
    private String userFirstname;
    private String userLastname;
    private String esignatureProfessionalTitle;
    private String esignaturePostNominalTitle;
    private byte[] esignaturePhoto;
    private String unitType; // New field for unit type

    public ReportDetailsDTO(Report report, Prerequisite prerequisite, User user, ESignature esignature) {
        this.report = new ReportDTO(report);
        this.prerequisite = prerequisite;
        this.userFirstname = user.getFirstname();
        this.userLastname = user.getLastname();
        this.esignatureProfessionalTitle = esignature.getProfessionalTitle();
        this.esignaturePostNominalTitle = esignature.getPostNominalTitle();
        this.esignaturePhoto = esignature.getESignaturePhoto();
        this.unitType = prerequisite.getUnitType(); // Set the unit type
    }

    // Getters and Setters
    public ReportDTO getReport() {
        return report;
    }

    public void setReport(ReportDTO report) {
        this.report = report;
    }

    public Prerequisite getPrerequisite() {
        return prerequisite;
    }

    public void setPrerequisite(Prerequisite prerequisite) {
        this.prerequisite = prerequisite;
    }

    public String getUserFirstname() {
        return userFirstname;
    }

    public void setUserFirstname(String userFirstname) {
        this.userFirstname = userFirstname;
    }

    public String getUserLastname() {
        return userLastname;
    }

    public void setUserLastname(String userLastname) {
        this.userLastname = userLastname;
    }

    public String getEsignatureProfessionalTitle() {
        return esignatureProfessionalTitle;
    }

    public void setEsignatureProfessionalTitle(String esignatureProfessionalTitle) {
        this.esignatureProfessionalTitle = esignatureProfessionalTitle;
    }

    public String getEsignaturePostNominalTitle() {
        return esignaturePostNominalTitle;
    }

    public void setEsignaturePostNominalTitle(String esignaturePostNominalTitle) {
        this.esignaturePostNominalTitle = esignaturePostNominalTitle;
    }

    public byte[] getEsignaturePhoto() {
        return esignaturePhoto;
    }

    public void setEsignaturePhoto(byte[] esignaturePhoto) {
        this.esignaturePhoto = esignaturePhoto;
    }

    public String getUnitType() {
        return unitType;
    }

    public void setUnitType(String unitType) {
        this.unitType = unitType;
    }
}
