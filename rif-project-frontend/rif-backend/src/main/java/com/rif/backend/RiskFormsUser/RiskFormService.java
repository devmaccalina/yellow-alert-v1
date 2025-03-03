package com.rif.backend.RiskFormsUser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.rif.backend.Auth.User;
import com.rif.backend.Auth.UserRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RiskFormService {

    @Autowired
    private RiskFormRepository riskFormRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ResponsiblePersonRepository responsiblePersonRepository;

    @Autowired
    private UserRepository userRepository;
    
@Transactional
public void saveRiskFormDataList(List<RiskFormData> formDataList) {
    if (!formDataList.isEmpty()) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Report report = formDataList.get(0).getReport() != null
                        ? reportRepository.findById(formDataList.get(0).getReport().getId()).orElse(new Report())
                        : new Report();
        report.setUser(user);
        report.setStatus(Report.ReportStatus.APPROVER_PENDING); // Reset status to APPROVER_PENDING
        reportRepository.save(report);

        for (RiskFormData formData : formDataList) {
            formData.setReport(report);

            formData.getOpportunities().forEach(opportunity -> opportunity.setRiskFormData(formData));
            formData.getActionPlans().forEach(actionPlan -> actionPlan.setRiskFormData(formData));
            formData.getRiskParticulars().forEach(riskParticular -> riskParticular.setRiskFormData(formData));
            formData.convertNamesToResponsiblePersons();

            riskFormRepository.save(formData);
        }
    }
}



    public List<RiskFormDataGroupedDTO> getRiskFormDataGroupedBySdaNumber() {
        List<Object[]> results = riskFormRepository.findGroupedBySdaNumber();
        return results.stream().map(result -> new RiskFormDataGroupedDTO(
            (Integer) result[0],
            (String) result[1],
            Arrays.asList(((String) result[2]).split(",")),
            (String) result[3],
            (String) result[4],
            (Integer) result[5],
            (String) result[6]
        )).collect(Collectors.toList());
    }

@Transactional(readOnly = true)
public List<RiskFormDataCustomDTO> getRiskFormDataBySdaNumber(Integer sdaNumber) {
    List<Object[]> results = riskFormRepository.findRiskFormDataBySdaNumber(sdaNumber);
    return results.stream()
            .map(result -> new RiskFormDataCustomDTO((String) result[0], (String) result[1], (String) result[2], (String) result[3], (String) result[4]))
            .collect(Collectors.toList());
}

@Transactional(readOnly = true)
public List<PrerequisiteDataDTO> getAllRiskFormData() {
    List<Object[]> results = riskFormRepository.findAllRiskFormData();
    return results.stream()
            .filter(result -> "ADMIN_VERIFIED".equals(result[6])) // Assuming the status is the 7th field in the result array
            .map(result -> new PrerequisiteDataDTO((String) result[0], (String) result[1], (Integer) result[2], (String) result[3], (String) result[4], (String) result[5]))
            .collect(Collectors.toList());
}


    @Transactional(readOnly = true)
    public Optional<Report> findById(Long reportId) {
        return reportRepository.findById(reportId);
    }
@Transactional(readOnly = true)
public List<RiskFormDataCustomDTO> getRiskFormDataByUserEmailAndSda(String email, Integer sdaNumber) {
    List<Object[]> results = riskFormRepository.findRiskFormDataByUserEmailAndSda(email, sdaNumber);
    return results.stream()
            .filter(result -> "ADMIN_VERIFIED".equals(result[5])) // Assuming the status is the 6th field in the result array
            .map(result -> new RiskFormDataCustomDTO((String) result[0], (String) result[1], (String) result[2], (String) result[3], (String) result[4]))
            .collect(Collectors.toList());
}


@Transactional(readOnly = true)
public List<RiskFormDataCustomDTO> getRiskFormDataByApproverUnit(String email, Integer sdaNumber) {
    List<Object[]> results = riskFormRepository.findRiskFormDataByApproverUnit(email, sdaNumber);
    return results.stream()
            .map(result -> new RiskFormDataCustomDTO((String) result[0], (String) result[1], (String) result[2], (String) result[3], (String) result[4]))
            .collect(Collectors.toList());
}

@Transactional(readOnly = true)
public List<PrerequisiteDataDTO> getRiskFormDataByUserEmailForSDAComparison(String email) {
    List<Object[]> results = riskFormRepository.findRiskFormDataByUserEmailForSDAComparison(email);
    return results.stream()
            .filter(result -> "ADMIN_VERIFIED".equals(result[6])) // Assuming the status is the 7th field in the result array
            .map(result -> new PrerequisiteDataDTO((String) result[0], (String) result[1], (Integer) result[2], (String) result[3], (String) result[4], (String) result[5]))
            .collect(Collectors.toList());
}

@Transactional(readOnly = true)
public List<PrerequisiteDataDTO> getRiskFormDataForApproverUnit(String email) {
    List<Object[]> results = riskFormRepository.findRiskFormDataForApproverUnit(email);
    return results.stream()
            .filter(result -> "ADMIN_VERIFIED".equals(result[6])) // Assuming the status is the 7th field in the result array
            .map(result -> new PrerequisiteDataDTO((String) result[0], (String) result[1], (Integer) result[2], (String) result[3], (String) result[4], (String) result[5]))
            .collect(Collectors.toList());
}


}
