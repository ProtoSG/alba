package pe.edu.unmsm.tamizaje.auth;

import jakarta.validation.Valid;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.unmsm.tamizaje.auth.AuthDtos.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "email already registered");
        }
        User u = users.save(new User(email, encoder.encode(req.password()), req.fullName().trim(), Instant.now()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(jwt.generate(u.getId(), email), u.getId(), email, u.getFullName()));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        User u = users.findByEmail(req.email().trim().toLowerCase())
                .filter(x -> encoder.matches(req.password(), x.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials"));
        return new AuthResponse(jwt.generate(u.getId(), u.getEmail()), u.getId(), u.getEmail(), u.getFullName());
    }
}
