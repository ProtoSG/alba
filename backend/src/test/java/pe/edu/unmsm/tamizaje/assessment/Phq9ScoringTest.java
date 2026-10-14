package pe.edu.unmsm.tamizaje.assessment;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class Phq9ScoringTest {

    @Test
    void sumsAnswers() {
        assertEquals(27, Phq9Scoring.totalScore(Collections.nCopies(9, 3)));
        assertEquals(0, Phq9Scoring.totalScore(Collections.nCopies(9, 0)));
        assertEquals(9, Phq9Scoring.totalScore(List.of(1, 1, 1, 1, 1, 1, 1, 1, 1)));
    }

    @ParameterizedTest
    @CsvSource({"0,MINIMAL", "4,MINIMAL", "5,MILD", "9,MILD", "10,MODERATE", "14,MODERATE",
                "15,MODERATELY_SEVERE", "19,MODERATELY_SEVERE", "20,SEVERE", "27,SEVERE"})
    void mapsSeverityBoundaries(int score, SeverityLevel expected) {
        assertEquals(expected, SeverityLevel.fromScore(score));
    }

    @Test
    void rejectsOutOfRangeScore() {
        assertThrows(IllegalArgumentException.class, () -> SeverityLevel.fromScore(28));
        assertThrows(IllegalArgumentException.class, () -> SeverityLevel.fromScore(-1));
    }

    @Test
    void rejectsInvalidAnswers() {
        assertThrows(IllegalArgumentException.class, () -> Phq9Scoring.totalScore(List.of(1, 2)));
        assertThrows(IllegalArgumentException.class,
                () -> Phq9Scoring.totalScore(List.of(0, 0, 0, 0, 0, 0, 0, 0, 4)));
    }

    @Test
    void item9AlertIndependentOfTotal() {
        List<Integer> a = List.of(0, 0, 0, 0, 0, 0, 0, 0, 1);
        assertTrue(Phq9Scoring.suicideIdeationAlert(a));
        assertEquals(SeverityLevel.MINIMAL, SeverityLevel.fromScore(Phq9Scoring.totalScore(a)));
        assertTrue(Phq9Scoring.referralRecommended(SeverityLevel.MINIMAL, true));
        assertFalse(Phq9Scoring.suicideIdeationAlert(List.of(3, 3, 3, 3, 3, 3, 3, 3, 0)));
    }

    @Test
    void referralForSevere() {
        assertTrue(Phq9Scoring.referralRecommended(SeverityLevel.SEVERE, false));
        assertFalse(Phq9Scoring.referralRecommended(SeverityLevel.MODERATELY_SEVERE, false));
    }
}
