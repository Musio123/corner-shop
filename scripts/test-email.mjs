// Sends one test email through Brevo using the same request shape as lib/brevo.js.
// (Inlined here so it runs under plain Node without the Next.js "@/..." alias.)
// Run with:  node --env-file=.env.local scripts/test-email.mjs your@email.com
const apiKey = process.env.BREVO_API_KEY;
const fromEmail = process.env.BREVO_FROM_EMAIL;
const fromName = process.env.BREVO_FROM_NAME || "Corner Shop";
const to = process.argv[2] || fromEmail;

if (!apiKey || !fromEmail) {
  console.error("❌ BREVO_API_KEY or BREVO_FROM_EMAIL is not set in .env.local");
  process.exit(1);
}

try {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { email: fromEmail, name: fromName },
      to: [{ email: to, name: "Test" }],
      subject: "Corner Shop - Brevo test email",
      htmlContent: "<h2>It works! 🎉</h2><p>This is a test email from your Corner Shop app. If you received it, Brevo is configured correctly.</p>",
      textContent: "It works! This is a test email from your Corner Shop app.",
    }),
  });

  const data = await res.text();
  if (!res.ok) {
    console.error(`❌ Brevo error ${res.status}: ${data}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ Email sent to ${to}. Brevo response: ${data}`);
    console.log("Check that inbox (and spam) for the test message.");
  }
} catch (err) {
  console.error("❌ Failed:", err.message);
  process.exitCode = 1;
}

