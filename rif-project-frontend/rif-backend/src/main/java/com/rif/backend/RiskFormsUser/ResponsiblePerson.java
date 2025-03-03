package com.rif.backend.RiskFormsUser;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "responsible_persons")
public class ResponsiblePerson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_form_data_id", nullable = false)
    @JsonBackReference  // This annotation prevents the serialization of the parent side to avoid infinite recursion.
    private RiskFormData riskFormData;

    // Default constructor
    public ResponsiblePerson() {
    }

    // Parameterized constructor for convenience
    public ResponsiblePerson(String name, RiskFormData riskFormData) {
        this.name = name;
        this.riskFormData = riskFormData;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public RiskFormData getRiskFormData() {
        return riskFormData;
    }

    public void setRiskFormData(RiskFormData riskFormData) {
        this.riskFormData = riskFormData;
    }

    @Override
    public String toString() {
        return "ResponsiblePerson{" +
               "id=" + id +
               ", name='" + name + '\'' +
               ", riskFormData=" + (riskFormData != null ? riskFormData.getId() : "null") +
               '}';
    }
}
