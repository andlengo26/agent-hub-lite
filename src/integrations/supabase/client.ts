// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://budtulhiwzuzwijschnf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZHR1bGhpd3p1endpanNjaG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjkwNjMsImV4cCI6MjA2OTEwNTA2M30.lB0wozTcW0jy_pz3JbhH9CaKY2OUTQSinczPiqWsy2s";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});