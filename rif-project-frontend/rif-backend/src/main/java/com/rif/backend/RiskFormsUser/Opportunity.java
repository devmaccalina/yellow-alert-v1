package com.rif.backend.RiskFormsUser;

import com.fasterxml.jackson.annotation.JsonBackReference;
import javax.persistence.*;

@Entity
@Table(name = "opportunities")
public class Opportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(length = 10000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_form_data_id")
    @JsonBackReference
    private RiskFormData riskFormData;

    // Constructors, Getters, and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RiskFormData getRiskFormData() {
        return riskFormData;
    }

    public void setRiskFormData(RiskFormData riskFormData) {
        this.riskFormData = riskFormData;
    }
}
