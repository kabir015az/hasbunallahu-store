// ==========================================
// HASBUNALLAHU STORE
// SUPABASE CLIENT
// ==========================================

const SUPABASE_URL =
    "https://qreliegujlmmsnyewtaq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_jg8JAA8WZfYAEsy7VY6DIQ_xyI_vtg5";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storage: window.localStorage
            }
        }
    );

console.log(
    "Supabase client loaded successfully."
);