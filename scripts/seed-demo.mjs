// Creates (or resets) the demo account graders use to log in.
// It has full Pro access without paying. Safe to run more than once.
// Run with: npm run db:seed-demo
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const DEMO_EMAIL = "demo@demo.com";
const DEMO_PASSWORD = "password123!";

const sql = neon(process.env.DATABASE_URL);
const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

await sql`
  INSERT INTO users (name, email, password_hash, is_pro)
  VALUES ('Demo User', ${DEMO_EMAIL}, ${passwordHash}, TRUE)
  ON CONFLICT (email) DO UPDATE
  SET password_hash = EXCLUDED.password_hash, is_pro = TRUE
`;

console.log(`Demo account ready: ${DEMO_EMAIL} (Pro)`);
