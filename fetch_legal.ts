
import { getLegalDocument } from "@/features/support/actions";

async function main() {
    console.log("Fetching Privacy Policy...");
    const privacy = await getLegalDocument("privacy");
    console.log("--- PRIVACY ---");
    console.log(privacy?.content || "No content");

    console.log("\nFetching Terms...");
    const terms = await getLegalDocument("terms");
    console.log("--- TERMS ---");
    console.log(terms?.content || "No content");
}

main();
