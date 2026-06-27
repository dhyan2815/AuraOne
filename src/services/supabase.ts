// Supabase client instance — Initializes client connection for database CRUD operations and realtime listeners.

import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from local environment variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Halt application startup if crucial Supabase credentials are missing.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in the .env file');
}

// Instantiate and export the Supabase client singleton instance.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
