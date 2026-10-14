import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setToken, type AuthResponse } from './api';

type AuthCtx = {
  user: AuthResponse | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, consent: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export const useAuth = () => useContext(Ctx);
const KEY = 'session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then((raw) => {
        if (raw) {
          const u = JSON.parse(raw) as AuthResponse;
          setToken(u.token);
          setUser(u);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = async (u: AuthResponse) => {
    setToken(u.token);
    setUser(u);
    try {
      await SecureStore.setItemAsync(KEY, JSON.stringify(u));
    } catch {}
  };

  const value: AuthCtx = {
    user,
    ready,
    login: async (e, p) => persist(await api.login(e, p)),
    register: async (e, p, n, c) => persist(await api.register(e, p, n, c)),
    logout: async () => {
      setToken(null);
      setUser(null);
      try {
        await SecureStore.deleteItemAsync(KEY);
      } catch {}
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
