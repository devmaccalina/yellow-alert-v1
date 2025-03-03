package com.rif.backend.RiskFormsUser;

public class RiskFormDataCustomDTO {
    private String unit;
    private String unitType;
    private String riskLevel;
    private String submissionDate;
    private String riskType;

    public RiskFormDataCustomDTO(String unit, String unitType, String riskLevel, String submissionDate, String riskType) {
        this.unit = unit;
        this.unitType = unitType;
        this.riskLevel = riskLevel;
        this.submissionDate = submissionDate;
        this.riskType = riskType;
    }

    // Getters and Setters
    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getUnitType() {
        return unitType;
    }

    public void setUnitType(String unitType) {
        this.unitType = unitType;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(String submissionDate) {
        this.submissionDate = submissionDate;
    }

    public String getRiskType() {
        return riskType;
    }

    public void setRiskType(String riskType) {
        this.riskType = riskType;
    }
}
