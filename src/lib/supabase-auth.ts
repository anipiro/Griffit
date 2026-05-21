import { supabase } from "@/integrations/supabase/client";

type AuthResponse = {
  data: {
    user: any | null;
    session?: any | null;
  };
  error: any | null;
};

const missingAuthMethodError = (method: string) =>
  new Error(
    `Authentication is not ready yet (${method} is unavailable). Please refresh the preview and try again.`
  );

const normalizeAuthResponse = (response: any): AuthResponse => ({
  data: response?.data ?? {
    user: response?.user ?? null,
    session: response?.session ?? null,
  },
  error: response?.error ?? null,
});

export const signInWithEmailPassword = async (email: string, password: string): Promise<AuthResponse> => {
  const auth = supabase.auth as any;

  if (typeof auth.signInWithPassword === "function") {
    return normalizeAuthResponse(await auth.signInWithPassword({ email, password }));
  }

  if (typeof auth.signIn === "function") {
    return normalizeAuthResponse(await auth.signIn({ email, password }));
  }

  return { data: { user: null, session: null }, error: missingAuthMethodError("signInWithPassword") };
};

export const signUpWithEmailPassword = async (
  email: string,
  password: string,
  emailRedirectTo: string
): Promise<AuthResponse> => {
  const auth = supabase.auth as any;

  if (typeof auth.signUp !== "function") {
    return { data: { user: null, session: null }, error: missingAuthMethodError("signUp") };
  }

  return normalizeAuthResponse(
    await auth.signUp(
      {
        email,
        password,
        options: { emailRedirectTo },
      },
      { redirectTo: emailRedirectTo }
    )
  );
};