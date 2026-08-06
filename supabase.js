"use strict";

const SUPABASE_URL =
  "https://nolfvhjtzfpwajxrzvrd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_-hDq7hg7JhajyrFi7rBHPA_eQZNsdLc";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
