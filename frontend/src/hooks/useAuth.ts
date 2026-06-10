// TODO: Replace all internals with Supabase auth.
// The exported interface { session, loading, error, signUp, signIn, signOut }
// must remain identical so screens need no changes after the swap.
import { useState, useCallback } from 'react';

export interface AuthSession {
  user: { id: string; email: string };
}

interface AuthState {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
}

const STUB_LATENCY_MS = 600;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: false,
    error: null,
  });

  const signUp = useCallback(async (email: string, password: string): Promise<void> => {
    setState(s => ({ ...s, loading: true, error: null }));
    if (!email.trim() || !password) {
      setState(s => ({ ...s, loading: false, error: 'empty_fields' }));
      return;
    }
    if (!isValidEmail(email)) {
      setState(s => ({ ...s, loading: false, error: 'invalid_email' }));
      return;
    }
    if (password.length < 6) {
      setState(s => ({ ...s, loading: false, error: 'password_too_short' }));
      return;
    }
    await new Promise<void>(r => setTimeout(r, STUB_LATENCY_MS));
    setState({
      session: { user: { id: 'stub-user-id', email: email.trim() } },
      loading: false,
      error: null,
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    setState(s => ({ ...s, loading: true, error: null }));
    if (!email.trim() || !password) {
      setState(s => ({ ...s, loading: false, error: 'empty_fields' }));
      return;
    }
    if (!isValidEmail(email)) {
      setState(s => ({ ...s, loading: false, error: 'invalid_email' }));
      return;
    }
    if (password.length < 6) {
      setState(s => ({ ...s, loading: false, error: 'password_too_short' }));
      return;
    }
    await new Promise<void>(r => setTimeout(r, STUB_LATENCY_MS));
    setState({
      session: { user: { id: 'stub-user-id', email: email.trim() } },
      loading: false,
      error: null,
    });
  }, []);

  const signOut = useCallback((): void => {
    setState({ session: null, loading: false, error: null });
  }, []);

  return { ...state, signUp, signIn, signOut };
}
