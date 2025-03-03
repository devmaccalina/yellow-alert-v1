package com.rif.backend.RiskFormsUser;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    @Query("SELECT r FROM Report r WHERE r.user.email = :email")
    List<Report> findAllByUserEmail(String email);

@Query("SELECT r FROM Report r LEFT JOIN FETCH r.riskFormData WHERE r.id = :id")
Optional<Report> findByIdWithRiskForms(@Param("id") Long id);


    @Query("SELECT r FROM Report r JOIN r.user u JOIN u.prerequisite p WHERE p.unitType = :unitType")
    List<Report> findAllByUnitType(String unitType);

   @Query("SELECT COUNT(r) FROM Report r JOIN r.user u JOIN u.prerequisite p WHERE p.unitType = :unitType AND r.status = 'ADMIN_VERIFIED'")
long countByUnitType(String unitType);

@Query("SELECT COUNT(r) FROM Report r JOIN r.user u JOIN u.prerequisite p WHERE p.unitType = :unitType AND r.status = 'ADMIN_VERIFIED' AND r IN (SELECT rf.report FROM RiskFormData rf WHERE rf.submissionDate BETWEEN :startDate AND :endDate)")
long countByUnitTypeAndDateRange(@Param("unitType") String unitType, @Param("startDate") String startDate, @Param("endDate") String endDate);


      @Query("SELECT r FROM Report r JOIN r.user u JOIN u.prerequisite p WHERE p.unit = :unit OR p.unit = (SELECT a.approverUnit FROM Approver a WHERE a.user.email = :email)")
    List<Report> findAllByUserUnitOrApproverUnit(@Param("unit") String unit, @Param("email") String email);
    
    @Query("SELECT r FROM Report r WHERE r.status = 'APPROVER_APPROVED' OR r.status = 'ADMIN_VERIFIED'")
List<Report> findAllApprovedReports();

 @Query("SELECT p.unit FROM Report r JOIN Prerequisite p ON r.user.id = p.user.id WHERE r.id = :reportId")
    Optional<String> findPrerequisiteUnitByReportId(@Param("reportId") Long reportId);

}
