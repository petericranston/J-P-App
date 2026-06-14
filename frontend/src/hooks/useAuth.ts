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


export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: false,
    error: null,
  });

  const signUp = useCallback(async (_email: string, _password: string): Promise<void> => {
    setState({ session: { user: { id: 'stub-user-id', email: 'dev@local' } }, loading: false, error: null });
  }, []);

  const signIn = useCallback(async (_email: string, _password: string): Promise<void> => {
    setState({ session: { user: { id: 'stub-user-id', email: 'dev@local' } }, loading: false, error: null });
  }, []);

  const signOut = useCallback((): void => {
    setState({ session: null, loading: false, error: null });
  }, []);

  return { ...state, signUp, signIn, signOut };
}
