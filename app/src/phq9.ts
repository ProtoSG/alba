// Official Spanish PHQ-9 items (see documentos/phq-9-cuestionario-oficial.typ).
export const INSTRUCTION =
  'Durante las últimas 2 semanas, ¿qué tan seguido ha tenido molestias debido a los siguientes problemas?';

export const OPTIONS = [
  { value: 0, label: 'Ningún día' },
  { value: 1, label: 'Varios días' },
  { value: 2, label: 'Más de la mitad de los días' },
  { value: 3, label: 'Casi todos los días' },
];

export const ITEMS = [
  'Poco interés o placer en hacer cosas.',
  'Se ha sentido decaído(a), deprimido(a) o sin esperanzas.',
  'Ha tenido dificultad para quedarse o permanecer dormido(a), o ha dormido demasiado.',
  'Se ha sentido cansado(a) o con poca energía.',
  'Sin apetito o ha comido en exceso.',
  'Se ha sentido mal con usted mismo(a) — o que es un fracaso o que ha quedado mal con usted mismo(a) o con su familia.',
  'Ha tenido dificultad para concentrarse en ciertas actividades, tales como leer el periódico o ver la televisión.',
  '¿Se ha movido o hablado tan lento que otras personas podrían haberlo notado? O lo contrario — muy inquieto(a) o agitado(a) que ha estado moviéndose mucho más de lo normal.',
  'Pensamientos de que estaría mejor muerto(a) o de lastimarse de alguna manera.',
];

export type Severity = 'MINIMAL' | 'MILD' | 'MODERATE' | 'MODERATELY_SEVERE' | 'SEVERE';

export const SEVERITY_LABEL: Record<Severity, string> = {
  MINIMAL: 'Mínima',
  MILD: 'Leve',
  MODERATE: 'Moderada',
  MODERATELY_SEVERE: 'Moderadamente severa',
  SEVERE: 'Severa',
};

export const RISK_LABEL: Record<string, string> = {
  low: 'Bajo',
  moderate: 'Moderado',
  high: 'Alto',
};

// Top two classes closer than this are presented as "between X and Y", not as a single verdict.
export const CLOSE_CALL_MARGIN = 0.15;

const RISK_ORDER = ['low', 'moderate', 'high'];

/** Returns the two closest-ranked risk classes (ordered low -> high) when the model is undecided, else null. */
export function closeCall(probabilities: Record<string, number> | null | undefined): [string, string] | null {
  if (!probabilities) return null;
  const ranked = Object.entries(probabilities).sort((x, y) => y[1] - x[1]);
  if (ranked.length < 2 || ranked[0][1] - ranked[1][1] >= CLOSE_CALL_MARGIN) return null;
  const pair = [ranked[0][0], ranked[1][0]].sort((x, y) => RISK_ORDER.indexOf(x) - RISK_ORDER.indexOf(y));
  return [pair[0], pair[1]];
}

// Plain-language explanation shown under the score. Screening only, never a diagnosis.
export const SEVERITY_EXPLAIN: Record<Severity, string> = {
  MINIMAL: 'Casi no hay señales de malestar en las últimas dos semanas. Cuidar tu sueño y tus rutinas ayuda a mantenerte así.',
  MILD: 'Hay algunas señales de bajo ánimo. Es frecuente en la vida universitaria; vale la pena prestarles atención y hablar con alguien de confianza.',
  MODERATE: 'Tus respuestas muestran un malestar que podría estar afectando tu día a día. Conversar con un profesional puede ayudarte a sentirte mejor.',
  MODERATELY_SEVERE: 'Tus respuestas indican un malestar importante. Te recomendamos buscar apoyo profesional pronto; no tienes que pasar por esto solo(a).',
  SEVERE: 'Tus respuestas indican un malestar intenso. Hablar con un profesional de salud mental cuanto antes puede marcar una gran diferencia.',
};
