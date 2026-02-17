/**
 * Set tester=true for a user by email.
 * Run: npx tsx server/scripts/setTesterByEmail.ts <email>
 */
import { storage } from "../storage";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx server/scripts/setTesterByEmail.ts <email>");
  process.exit(1);
}

async function main() {
  const user = await storage.getUserByEmail(email);
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }
  await storage.updateUserTester(user.id, true);
  console.log(`Set tester=true for ${email} (id: ${user.id})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
