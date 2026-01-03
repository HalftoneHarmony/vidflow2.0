
import { createClient } from "@supabase/supabase-js";
// Environment variables provided via command line
// import dotenv from "dotenv";
// dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySeedData() {
    console.log("🔍 Verifying Seed Data...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 1. Check Events
    const { data: events, error: eventError } = await supabase
        .from("events")
        .select("*");

    if (eventError) {
        console.error("❌ Error fetching events:", eventError.message);
    } else {
        console.log(`✅ Events found: ${events?.length}`);
        events?.forEach((e) => console.log(`   - ${e.title} (${e.event_date})`));
    }

    console.log("----------------------------------");

    // 2. Check Packages
    const { data: packages, error: pkgError } = await supabase
        .from("packages")
        .select("*, events(title)");

    if (pkgError) {
        console.error("❌ Error fetching packages:", pkgError.message);
    } else {
        console.log(`✅ Packages found: ${packages?.length}`);
        packages?.forEach((p) =>
            console.log(`   - [${p.events?.title}] ${p.name}: ${p.price.toLocaleString()} KRW`)
        );
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

verifySeedData();
