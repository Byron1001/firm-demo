package com.lexiconlegal.service;

import com.lexiconlegal.model.ContactRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.firm-email}")
    private String firmEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendContactNotification(ContactRequest request) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(firmEmail);
        message.setSubject("New Consultation Request from " + request.getName());
        message.setText(buildEmailBody(request));

        mailSender.send(message);
    }

    private String buildEmailBody(ContactRequest request) {
        return """
                New consultation request received:
                
                Name: %s
                Email: %s
                Phone: %s
                Service: %s
                Message: %s
                """.formatted(
                request.getName(),
                request.getEmail(),
                request.getPhone() != null ? request.getPhone() : "N/A",
                request.getService() != null ? request.getService() : "N/A",
                request.getMessage()
        );
    }
}
