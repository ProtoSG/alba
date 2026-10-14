import { API_URL } from './config';
import type { Severity } from './phq9';

export type AuthResponse = { token: string; userId: number; email: string; fullName: string };

export type Assessment = {
  id: number;
  createdAt: string;
  answers: number[];
  totalScore: number;
  severityLevel: Severity;
  suicideAlert: boolean;
  referralRecommended: boolean;
  mlAvailable: boolean;
  mlRiskLevel: 'low' | 'moderate' | 'high' | null;
  mlProbabilities: Record<string, number> | null;
  mlModel: string | null;
  alertMessage: string | null;
};

export type CreateAssessment = {
  answers: number[];
  age: number;
  sex: 'F' | 'M';
  semester: number;
  sleepHours: number;
  weeklyStudyHours: number;
  worksPartTime: boolean;
  livesWithFamily: boolean;
};

export type Content = { id: string; title: string; body: string; riskLevels: string[] };

let token: string | null = null;
export const setToken = (t: string | null) => {
  token = t;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const body = await res.json();
      msg = body.error ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  register: (email: string, password: string, fullName: string, consent: boolean) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, consent }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  createAssessment: (body: CreateAssessment) =>
    request<Assessment>('/api/assessments', { method: 'POST', body: JSON.stringify(body) }),
  history: () => request<Assessment[]>('/api/assessments'),
  psychoeducation: (risk?: string) =>
    request<Content[]>(`/api/psychoeducation${risk ? `?risk=${risk}` : ''}`),
};
