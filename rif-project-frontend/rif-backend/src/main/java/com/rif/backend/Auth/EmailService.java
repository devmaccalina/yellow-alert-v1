package com.rif.backend.Auth;

import com.rif.backend.notification.Notification;
import com.rif.backend.notification.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public void sendApprovalEmail(String to, Long reportId, LocalDate approvalDate) {
        String formattedDate = approvalDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String subject = "YellowAlert - Risk Identification Form Approval Notification";
        String text = "Dear User,\n\n" +
                      "We are pleased to inform you that your Risk Identification Form (ID: " + reportId + ") submitted on " + formattedDate + " has been approved and is now awaiting verification from the Office of Planning and Quality Management (OPQM). \n\n" +
                      "If you have any questions, please do not hesitate to contact us.\n\n" +
                      "Best regards,\n" +
                      "Office of Planning and Quality Management (OPQM)";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);

        // Create notification for the user
        User user = userRepository.findByEmail(to).orElseThrow(() -> new RuntimeException("User not found"));
        Notification userNotification = new Notification(user, "Your Risk Identification Form (ID: " + reportId + ") has been approved.", LocalDateTime.now());
        notificationRepository.save(userNotification);

        // Create notification for the approver
        String approverEmail = getCurrentUserEmail();
        User approver = userRepository.findByEmail(approverEmail).orElseThrow(() -> new RuntimeException("Approver not found"));
        Notification approverNotification = new Notification(approver, "You have approved Risk Identification Form (ID: " + reportId + ").", LocalDateTime.now());
        notificationRepository.save(approverNotification);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        String subject = "YellowAlert - Password Reset Request";
        String text = "Dear User,\n\n" +
                      "We have received a request to reset your password. Please click the link below to choose a new password:\n\n" +
                      resetUrl + "\n\n" +
                      "If you did not request a password reset, please disregard this email or contact our support team if you have any concerns.\n\n" +
                      "Thank you,\n" +
                      "Office of Planning and Quality Management (OPQM)";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);

        // Create notification for the user
        User user = userRepository.findByEmail(to).orElseThrow(() -> new RuntimeException("User not found"));
        Notification userNotification = new Notification(user, "Password reset email sent.", LocalDateTime.now());
        notificationRepository.save(userNotification);

        // Create notification for the admin
        String adminEmail = getCurrentUserEmail();
        User admin = userRepository.findByEmail(adminEmail).orElseThrow(() -> new RuntimeException("Admin not found"));
        Notification adminNotification = new Notification(admin, "Password reset email sent to user " + user.getEmail(), LocalDateTime.now());
        notificationRepository.save(adminNotification);
    }

    public void sendRevisionEmail(String to, Long reportId, String comment, LocalDate submissionDate) {
        String formattedDate = submissionDate != null ? submissionDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "unknown date";
        String subject = "YellowAlert - Risk Identification Form Revision Required";
        String text = "Dear User,\n\n" +
                      "Your Risk Identification Form (ID: " + reportId + ") submitted on " + formattedDate + " has been reviewed and requires revision. \n\n" +
                      "Reviewer Comments: " + comment + "\n\n" +
                      "Please address the comments and resubmit your Risk Identification Form at your earliest convenience. If you have any questions, feel free to contact us.\n\n" +
                      "Thank you,\n" +
                      "Office of Planning and Quality Management (OPQM)";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);

        // Create notification for the user
        User user = userRepository.findByEmail(to).orElseThrow(() -> new RuntimeException("User not found"));
        Notification userNotification = new Notification(user, "Risk Identification Form (ID: " + reportId + ") requires revision.", LocalDateTime.now());
        notificationRepository.save(userNotification);

        // Create notification for the approver
        String approverEmail = getCurrentUserEmail();
        User approver = userRepository.findByEmail(approverEmail).orElseThrow(() -> new RuntimeException("Approver not found"));
        Notification approverNotification = new Notification(approver, "You have requested a revision for Risk Identification Form (ID: " + reportId + ").", LocalDateTime.now());
        notificationRepository.save(approverNotification);
    }

    public void sendVerificationEmail(String to, Long reportId, LocalDate verificationDate) {
        String formattedDate = verificationDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String subject = "YellowAlert - Risk Identification Form Verification Notification";
        String text = "Dear User,\n\n" +
                      "We are pleased to inform you that your Risk Identification Form (ID: " + reportId + ") submitted on " + formattedDate + " has been verified by the Office of Planning and Quality Management (OPQM). \n\n" +
                      "If you have any questions, please do not hesitate to contact us.\n\n" +
                      "Best regards,\n" +
                      "Office of Planning and Quality Management (OPQM)";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);

        // Create notification for the user
        User user = userRepository.findByEmail(to).orElseThrow(() -> new RuntimeException("User not found"));
        Notification userNotification = new Notification(user, "Your Risk Identification Form (ID: " + reportId + ") has been verified.", LocalDateTime.now());
        notificationRepository.save(userNotification);

        // Create notification for the admin
        String adminEmail = getCurrentUserEmail();
        User admin = userRepository.findByEmail(adminEmail).orElseThrow(() -> new RuntimeException("Admin not found"));
        Notification adminNotification = new Notification(admin, "You have verified Risk Identification Form (ID: " + reportId + ").", LocalDateTime.now());
        notificationRepository.save(adminNotification);
    }

    // New functions for admin-specific email notifications

    public void sendAdminVerificationEmail(String to, Long reportId, LocalDate verificationDate) {
        String formattedDate = verificationDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String subject = "YellowAlert - Risk Identification Form Verification Notification";
        String text = "Dear User,\n\n" +
                      "We are pleased to inform you that your Risk Identification Form (ID: " + reportId + ") submitted on " + formattedDate + " has been verified by the Office of Planning and Quality Management (OPQM). \n\n" +
                      "If you have any questions, please do not hesitate to contact us.\n\n" +
                      "Best regards,\n" +
                      "Office of Planning and Quality Management (OPQM)";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);

        // Create notification for the user
        User user = userRepository.findByEmail(to).orElseThrow(() -> new RuntimeException("User not found"));
        Notification userNotification = new Notification(user, "Your Risk Identification Form (ID: " + reportId + ") has been verified by admin.", LocalDateTime.now());
        notificationRepository.save(userNotification);

        // Create notification for the admin
        String adminEmail = getCurrentUserEmail();
        User admin = userRepository.findByEmail(adminEmail).orElseThrow(() -> new RuntimeException("Admin not found"));
        Notification adminNotification = new Notification(admin, "You have verified Risk Identification Form (ID: " + reportId + ") as an admin.", LocalDateTime.now());
        notificationRepository.save(adminNotification);
    }

    public void sendAdminRevisionEmail(String to, Long reportId, String comment, LocalDate submissionDate) {
        String formattedDate = submissionDate != null ? submissionDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "unknown date";
        String subject = "YellowAlert - Risk Identification Form Revision Required";
        String text = "Dear User,\n\n" +
                      "Your Risk Identification Form (ID: " + reportId + ") submitted on " + formattedDate + " has been reviewed and requires revision. \n\n" +
                      "Reviewer Comments: " + comment + "\n\n" +
                      "Please address the comments and resubmit your Risk Identification Form at your earliest convenience. If you have any questions, feel free to contact us.\n\n" +
                      "Thank you,\n" +
                      "Office of Planning and Quality Management (OPQM)";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);

        // Create notification for the user
        User user = userRepository.findByEmail(to).orElseThrow(() -> new RuntimeException("User not found"));
        Notification userNotification = new Notification(user, "Risk Identification Form (ID: " + reportId + ") requires revision by admin.", LocalDateTime.now());
        notificationRepository.save(userNotification);

        // Create notification for the admin
        String adminEmail = getCurrentUserEmail();
        User admin = userRepository.findByEmail(adminEmail).orElseThrow(() -> new RuntimeException("Admin not found"));
        Notification adminNotification = new Notification(admin, "You have requested a revision for Risk Identification Form (ID: " + reportId + ") as an admin.", LocalDateTime.now());
        notificationRepository.save(adminNotification);
    }

    private String getCurrentUserEmail() {
        // Logic to get the current user's email (either approver or admin)
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getUsername();
    }
}
