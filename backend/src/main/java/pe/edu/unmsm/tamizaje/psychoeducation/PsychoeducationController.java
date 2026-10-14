package pe.edu.unmsm.tamizaje.psychoeducation;

import java.util.List;
import java.util.Set;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Static CBT-based psychoeducation content (Spanish, user-facing). Not a substitute for professional care. */
@RestController
@RequestMapping("/api/psychoeducation")
public class PsychoeducationController {

    public record Content(String id, String title, String body, Set<String> riskLevels) {}

    private static final Set<String> ALL = Set.of("low", "moderate", "high");
    private static final Set<String> MOD_HIGH = Set.of("moderate", "high");

    static final List<Content> CONTENT = List.of(
        new Content("sleep-hygiene", "Higiene del sueño",
            "Mantén horarios regulares para dormir y despertar, evita pantallas y cafeína en la noche "
            + "y reserva la cama solo para dormir.", ALL),
        new Content("behavioral-activation", "Activación conductual",
            "Programa cada día una actividad pequeña que disfrutes o que te dé sensación de logro. "
            + "Actuar primero suele mejorar el ánimo después.", ALL),
        new Content("thought-record", "Registro de pensamientos",
            "Anota la situación, el pensamiento automático y la emoción. Luego busca evidencia a favor y en "
            + "contra y formula un pensamiento más equilibrado.", MOD_HIGH),
        new Content("study-planning", "Organiza tu carga académica",
            "Divide las tareas grandes en pasos pequeños, usa bloques de estudio de 25 a 45 minutos "
            + "y descansa entre bloques.", ALL),
        new Content("social-support", "Apóyate en tu red",
            "Conversa con alguien de confianza sobre cómo te sientes. Buscar apoyo es una señal de cuidado, "
            + "no de debilidad.", MOD_HIGH),
        new Content("seek-help", "Cuándo buscar ayuda profesional",
            "Si los síntomas persisten por más de dos semanas o afectan tu vida diaria, acude al servicio de "
            + "bienestar universitario o a un profesional de salud mental. Línea 113, opción 5, 24 horas.",
            Set.of("high")));

    @GetMapping
    public List<Content> list(@RequestParam(required = false) String risk) {
        if (risk == null || risk.isBlank()) return CONTENT;
        String r = risk.toLowerCase();
        return CONTENT.stream().filter(c -> c.riskLevels().contains(r)).toList();
    }
}
