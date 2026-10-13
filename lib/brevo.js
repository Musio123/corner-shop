import { formatPrice } from "@/lib/format";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Sends an email through Brevo's transactional email API (no extra library needed).
// Docs: https://developers.brevo.com/reference/send-transac-email
export async function sendEmail({ to, toName, subject, html, text }) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.BREVO_FROM_NAME || "Corner Shop";

  if (!apiKey || !fromEmail) {
    throw new Error(
      "BREVO_API_KEY or BREVO_FROM_EMAIL is missing in .env.local"
    );
  }

  const payload = {
    sender: { email: fromEmail, name: fromName },
    to: [{ email: to, name: toName || to }],
    subject,
    htmlContent: html,
    textContent: text,
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const details = await res.text();
    throw new Error(`Brevo error ${res.status}: ${details}`);
  }
  return res.json();
}

export async function sendOrderConfirmation(order, items) {
  const rows = items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(i.product_name)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(i.unit_price_cents * i.quantity)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222">
      <h2>Thanks for your order, ${escapeHtml(order.customer_name)}!</h2>
      <p>Your order <strong>#${order.id}</strong> has been received and is being processed.</p>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px">Item</th>
            <th style="padding:8px">Qty</th>
            <th style="text-align:right;padding:8px">Price</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="text-align:right;font-size:18px"><strong>Total: ${formatPrice(order.total_cents)}</strong></p>
      <h3>Shipping to</h3>
      <p>
        ${escapeHtml(order.customer_name)}<br/>
        ${escapeHtml(order.address)}<br/>
        ${escapeHtml(order.city)}, ${escapeHtml(order.country)}<br/>
        ${escapeHtml(order.phone)}
      </p>
      <p style="color:#888;font-size:12px">Corner Shop</p>
    </div>`;

  const text =
    `Thanks for your order, ${order.customer_name}!\n\n` +
    `Order #${order.id}\n\n` +
    items
      .map((i) => `${i.product_name} x${i.quantity} - ${formatPrice(i.unit_price_cents * i.quantity)}`)
      .join("\n") +
    `\n\nTotal: ${formatPrice(order.total_cents)}\n\n` +
    `Shipping to: ${order.customer_name}, ${order.address}, ${order.city}, ${order.country}`;

  return sendEmail({
    to: order.email,
    toName: order.customer_name,
    subject: `Order #${order.id} confirmed - Corner Shop`,
    html,
    text,
  });
}
