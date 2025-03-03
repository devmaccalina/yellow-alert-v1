package com.rif.backend.RiskFormsUser;

import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "action_plans")
public class ActionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(length = 10000) // Increase the length to accommodate larger text
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_form_data_id")
    @JsonBackReference
    private RiskFormData riskFormData;

    // Default constructor
    public ActionPlan() {
    }

    // Getters and setters
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
