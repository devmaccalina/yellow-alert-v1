package com.rif.backend.Prerequisites;

import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.rif.backend.Auth.User;
import java.util.List;

@Entity
public class Prerequisite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String unit;
    private String unitType;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @JsonBackReference
    private User user;

    @OneToMany(mappedBy = "prerequisite", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<InternalStakeholder> internalStakeholders;

    @OneToMany(mappedBy = "prerequisite", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ExternalStakeholder> externalStakeholders;

    // Constructors, getters, and setters
    public Prerequisite() {}

    public Prerequisite(String unit, String unitType, User user) {
        this.unit = unit;
        this.unitType = unitType;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<InternalStakeholder> getInternalStakeholders() {
        return internalStakeholders;
    }

    public void setInternalStakeholders(List<InternalStakeholder> internalStakeholders) {
        this.internalStakeholders = internalStakeholders;
    }

    public List<ExternalStakeholder> getExternalStakeholders() {
        return externalStakeholders;
    }

    public void setExternalStakeholders(List<ExternalStakeholder> externalStakeholders) {
        this.externalStakeholders = externalStakeholders;
    }
}
