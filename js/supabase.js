// ==========================================
// HASBUNALLAHU STORE
// SUPABASE CLIENT
// ==========================================

const SUPABASE_URL =
    "https://qreliegujlmmsnyewtaq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_jg8JAA8WZfYAEsy7VY6DIQ_xyI_vtg5";


// ==========================================
// CREATE SUPABASE CLIENT
// ==========================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// CHECK CONNECTION
// ==========================================

console.log(
    "Hasbunallahu Store Supabase client loaded."
);