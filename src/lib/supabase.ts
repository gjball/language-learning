import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

/** Null until the Supabase URL and key have been added to the `.env` file. */
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          storage: AsyncStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const NOT_CONFIGURED_MESSAGE =
  'Phone sessions are not set up yet: add your Supabase URL and key to the .env file, then restart the app.';

export function requireSupabase() {
  if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);
  return supabase;
}

/**
 * Makes sure this device has a guest identity and returns its user ID. The
 * identity is remembered on the device, so reopening the app keeps you in
 * your session.
 */
export async function ensureSignedIn(): Promise<string> {
  const client = requireSupabase();

  const { data: existing } = await client.auth.getSession();
  if (existing.session) return existing.session.user.id;

  const { data, error } = await client.auth.signInAnonymously();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Could not sign in as a guest.');
  return data.user.id;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
