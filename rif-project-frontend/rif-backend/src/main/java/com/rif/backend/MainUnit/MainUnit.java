package com.rif.backend.MainUnit;

import javax.persistence.*;

@Entity
@Table(name = "main_units")
public class MainUnit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String mainUnit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MainUnitType mainUnitType;

    public MainUnit() {
    }

    public MainUnit(String mainUnit, MainUnitType mainUnitType) {
        this.mainUnit = mainUnit;
        this.mainUnitType = mainUnitType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMainUnit() {
        return mainUnit;
    }

    public void setMainUnit(String mainUnit) {
        this.mainUnit = mainUnit;
    }

    public MainUnitType getMainUnitType() {
        return mainUnitType;
    }

    public void setMainUnitType(MainUnitType mainUnitType) {
        this.mainUnitType = mainUnitType;
    }
}
