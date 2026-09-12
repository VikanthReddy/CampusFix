package app.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EmailService {

    private final Optional<JavaMailSender> mailSender;

    public EmailService(Optional<JavaMailSender> mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(
            String to,
            String subject,
            String message) {

        if (mailSender.isEmpty()) {

            System.out.println(
                    "Email service is not configured. Email not sent."
            );

            return;
        }

        SimpleMailMessage mail =
                new SimpleMailMessage();

        mail.setTo(to);
        mail.setSubject(subject);
        mail.setText(message);

        mailSender.get().send(mail);
    }
}