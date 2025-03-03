package com.rif.backend.RiskFormsUser;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskFormRepository extends JpaRepository<RiskFormData, Long> {

  
  @Query(value = "SELECT rf.sda_number as sdaNumber, rf.issue_particulars as issueParticulars, " +
               "GROUP_CONCAT(rp.description) as riskParticularDescriptions, p.unit as unit, rf.submission_date as submissionDate, rf.risk_rating as riskRating, rf.risk_level as riskLevel " +
               "FROM risk_forms rf " +
               "JOIN risk_particulars rp ON rf.id = rp.risk_form_data_id " +
               "JOIN reports r ON rf.report_id = r.id " +
               "JOIN user u ON r.user_id = u.id " +
               "JOIN prerequisite p ON u.id = p.user_id " +
               "WHERE r.status = 'ADMIN_VERIFIED' " +
               "GROUP BY rf.sda_number, rf.issue_particulars, p.unit, rf.submission_date, rf.risk_rating, rf.risk_level", nativeQuery = true)
List<Object[]> findGroupedBySdaNumber();


@Query(value = "SELECT p.unit as unit, p.unit_type as unitType, rf.risk_level as riskLevel, rf.submission_date as submissionDate, rf.risk_type as riskType " +
               "FROM risk_forms rf " +
               "JOIN reports r ON rf.report_id = r.id " +
               "JOIN user u ON r.user_id = u.id " +
               "JOIN prerequisite p ON u.id = p.user_id " +
               "WHERE rf.sda_number = :sdaNumber AND r.status = 'ADMIN_VERIFIED'", nativeQuery = true)
List<Object[]> findRiskFormDataBySdaNumber(Integer sdaNumber);


@Query(value = "SELECT p.unit as unit, p.unit_type as unitType, rf.sda_number as sdaNumber, rf.risk_level as riskLevel, rf.submission_date as submissionDate, rf.risk_type as riskType, r.status as status " +
               "FROM risk_forms rf " +
               "JOIN reports r ON rf.report_id = r.id " +
               "JOIN user u ON r.user_id = u.id " +
               "JOIN prerequisite p ON u.id = p.user_id " +
               "WHERE r.status = 'ADMIN_VERIFIED'", nativeQuery = true)
List<Object[]> findAllRiskFormData();

@Query(value = "SELECT p.unit as unit, p.unit_type as unitType, rf.risk_level as riskLevel, rf.submission_date as submissionDate, rf.risk_type as riskType, r.status as status " +
               "FROM risk_forms rf " +
               "JOIN reports r ON rf.report_id = r.id " +
               "JOIN user u ON r.user_id = u.id " +
               "JOIN prerequisite p ON u.id = p.user_id " +
               "WHERE u.email = :email " +
               "AND (:sdaNumber IS NULL OR rf.sda_number = :sdaNumber) " +
               "AND r.status = 'ADMIN_VERIFIED'", nativeQuery = true)
List<Object[]> findRiskFormDataByUserEmailAndSda(@Param("email") String email, @Param("sdaNumber") Integer sdaNumber);


@Query(value = "SELECT p.unit as unit, p.unit_type as unitType, rf.risk_level as riskLevel, rf.submission_date as submissionDate, rf.risk_type as riskType " +
               "FROM risk_forms rf " +
               "JOIN reports r ON rf.report_id = r.id " +
               "JOIN user u ON r.user_id = u.id " +
               "JOIN prerequisite p ON u.id = p.user_id " +
               "WHERE p.unit = (SELECT a.approver_unit FROM approvers a JOIN user u2 ON a.user_id = u2.id WHERE u2.email = :email) " +
               "AND (:sdaNumber IS NULL OR rf.sda_number = :sdaNumber) " +
               "AND r.status = 'ADMIN_VERIFIED'", nativeQuery = true)
List<Object[]> findRiskFormDataByApproverUnit(@Param("email") String email, @Param("sdaNumber") Integer sdaNumber);

   
@Query(value = "SELECT p.unit as unit, p.unit_type as unitType, rf.sda_number as sdaNumber, rf.risk_level as riskLevel, rf.submission_date as submissionDate, rf.risk_type as riskType, r.status as status " +
               "FROM risk_forms rf " +
               "JOIN reports r ON rf.report_id = r.id " +
               "JOIN user u ON r.user_id = u.id " +
               "JOIN prerequisite p ON u.id = p.user_id " +
               "WHERE u.email = :email " +
               "AND r.status = 'ADMIN_VERIFIED'", nativeQuery = true)
List<Object[]> findRiskFormDataByUserEmailForSDAComparison(@Param("email") String email);


@Query(value = "SELECT p.unit as unit, p.unit_type as unitType, rf.sda_number as sdaNumber, rf.risk_level as riskLevel, rf.submission_date as submissionDate, rf.risk_type as riskType, r.status as status " +
               "FROM risk_forms rf " +
               "JOIN reports r ON rf.report_id = r.id " +
               "JOIN user u ON r.user_id = u.id " +
               "JOIN prerequisite p ON u.id = p.user_id " +
               "WHERE p.unit = (SELECT a.approver_unit FROM approvers a JOIN user u2 ON a.user_id = u2.id WHERE u2.email = :email) " +
               "AND r.status = 'ADMIN_VERIFIED'", nativeQuery = true)
List<Object[]> findRiskFormDataForApproverUnit(@Param("email") String email);


}
