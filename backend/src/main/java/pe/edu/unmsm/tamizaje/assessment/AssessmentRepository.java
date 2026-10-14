package pe.edu.unmsm.tamizaje.assessment;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByUserIdOrderByCreatedAtDesc(Long userId);
}
