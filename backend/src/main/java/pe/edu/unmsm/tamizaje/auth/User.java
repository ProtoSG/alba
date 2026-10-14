package pe.edu.unmsm.tamizaje.auth;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    @Column(name = "full_name", nullable = false)
    private String fullName;
    @Column(name = "consent_at", nullable = false)
    private Instant consentAt;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected User() {}

    public User(String email, String passwordHash, String fullName, Instant consentAt) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.consentAt = consentAt;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getFullName() { return fullName; }
}
