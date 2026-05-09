/**
 * Notification service — email (Gmail SMTP) + WhatsApp (Twilio)
 * All functions are fire-and-forget safe (they catch their own errors)
 */
import nodemailer from "nodemailer";

// ─── Site theme colours (matching globals.css) ────────────────────────────────
const C = {
  primary:    "#b33f30",
  primaryDark:"#8b2f23",
  body:       "#fdfbf7",
  card:       "#f7f1e9",
  border:     "#e5ded5",
  heading:    "#1a1612",
  bodyText:   "#4a443f",
  muted:      "#8c847c",
  secondary:  "#d9a05b",
  success:    "#5b6d5b",
  footer:     "#f6ece5",
};

// ─── Shared email wrapper ─────────────────────────────────────────────────────
function emailWrapper(siteName: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${siteName}</title>
</head>
<body style="margin:0;padding:0;background:${C.body};font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.body};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${C.border};border-radius:4px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:${C.primary};padding:28px 40px;text-align:center;">
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7);font-family:Arial,sans-serif;">Handcrafted with Heritage</p>
            <h1 style="margin:0;font-size:28px;font-weight:normal;color:#ffffff;font-family:'Georgia',serif;letter-spacing:1px;">${siteName}</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${C.footer};border-top:1px solid ${C.border};padding:24px 40px;text-align:center;">
            <p style="margin:0 0 8px 0;font-size:12px;color:${C.muted};font-family:Arial,sans-serif;">
              © ${new Date().getFullYear()} ${siteName} · Preserving the Madhubani Legacy
            </p>
            <p style="margin:0;font-size:11px;color:${C.border};font-family:Arial,sans-serif;">
              Hand-Painted Mithila Art · Made in Bihar
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
const divider = `<tr><td colspan="3" style="padding:0;"><div style="height:1px;background:${C.border};margin:4px 0;"></div></td></tr>`;

// ─── Create in-app notification ───────────────────────────────────────────────
export async function createNotification(params: {
  type: "new_order" | "order_updated" | "new_contact" | "low_stock" | "new_user" | "payment_receipt";
  title: string;
  message: string;
  link?: string;
  data?: Record<string, unknown>;
}) {
  try {
    // Use the unified db layer so it works with both MongoDB and SQLite
    const { createNotificationRecord } = await import("@/lib/db");
    await createNotificationRecord(params);
  } catch (err) {
    console.error("createNotification error:", err);
  }
}

// ─── Gmail SMTP ───────────────────────────────────────────────────────────────
function getMailTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const transport = getMailTransport();
  if (!transport) {
    console.warn("Email not configured — skipping sendEmail");
    return;
  }
  try {
    await transport.sendMail({
      from: `"${process.env.SITE_NAME ?? "Heritage Threads"}" <${process.env.GMAIL_USER}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text ?? params.html.replace(/<[^>]+>/g, ""),
    });
  } catch (err) {
    console.error("sendEmail error:", err);
  }
}

// ─── WhatsApp via Twilio ──────────────────────────────────────────────────────
export async function sendWhatsApp(to: string, message: string) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) {
    console.warn("WhatsApp not configured — skipping");
    return;
  }
  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ From: from, To: toFormatted, Body: message }).toString(),
      }
    );
    const data = await res.json();
    if (!res.ok) console.error("Twilio error:", data);
  } catch (err) {
    console.error("sendWhatsApp error:", err);
  }
}

// ─── Order Confirmation Email ─────────────────────────────────────────────────
export function orderConfirmationEmail(
  order: {
    _id: string;
    items: { name: string; qty: number; price: number }[];
    subtotal: number;
    shippingCost: number;
    totalAmount: number;
    status: string;
    paymentMethod?: string;
    shippingAddress: {
      fullName: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      pincode: string;
      phone: string;
    };
  },
  siteName = "Heritage Threads"
): string {
  const orderId = order._id.toString().slice(-8).toUpperCase();

  // Item rows
  const itemRows = order.items.map((i) => `
    <tr>
      <td style="padding:12px 8px;font-size:14px;color:${C.bodyText};font-family:Arial,sans-serif;border-bottom:1px solid ${C.border};">
        ${i.name}
      </td>
      <td style="padding:12px 8px;font-size:14px;color:${C.muted};text-align:center;font-family:Arial,sans-serif;border-bottom:1px solid ${C.border};">
        ${i.qty}
      </td>
      <td style="padding:12px 8px;font-size:14px;color:${C.heading};text-align:right;font-family:Arial,sans-serif;border-bottom:1px solid ${C.border};">
        ₹${(i.price * i.qty).toLocaleString("en-IN")}
      </td>
    </tr>`).join("");

  const paymentBadge = order.paymentMethod === "cod"
    ? `<span style="background:#fff3cd;color:#856404;padding:2px 10px;border-radius:20px;font-size:11px;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:0.5px;">CASH ON DELIVERY</span>`
    : `<span style="background:#d4edda;color:#155724;padding:2px 10px;border-radius:20px;font-size:11px;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:0.5px;">PAID ONLINE</span>`;

  const addr = order.shippingAddress;
  const addressLine = [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode]
    .filter(Boolean).join(", ");

  const content = `
    <!-- Order badge -->
    <div style="display:inline-block;background:${C.card};border:1px solid ${C.border};border-radius:4px;padding:6px 16px;margin-bottom:24px;">
      <span style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;">Order #${orderId}</span>
    </div>

    <!-- Heading -->
    <h2 style="margin:0 0 8px 0;font-size:26px;font-weight:normal;color:${C.heading};font-family:'Georgia',serif;">
      Order Confirmed ✓
    </h2>
    <p style="margin:0 0 24px 0;font-size:15px;color:${C.bodyText};font-family:Arial,sans-serif;line-height:1.6;">
      Hi <strong>${addr.fullName}</strong>, thank you for your order!<br>
      We've received it and will begin preparing your artisanal piece shortly.
    </p>

    <!-- Items table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:4px;overflow:hidden;margin-bottom:24px;">
      <thead>
        <tr style="background:${C.card};">
          <th style="padding:12px 8px;text-align:left;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;font-weight:bold;">Product</th>
          <th style="padding:12px 8px;text-align:center;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;font-weight:bold;">Qty</th>
          <th style="padding:12px 8px;text-align:right;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;font-weight:bold;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <!-- Subtotal -->
        <tr style="background:${C.body};">
          <td colspan="2" style="padding:10px 8px;font-size:13px;color:${C.muted};text-align:right;font-family:Arial,sans-serif;">Subtotal</td>
          <td style="padding:10px 8px;font-size:13px;color:${C.bodyText};text-align:right;font-family:Arial,sans-serif;">₹${order.subtotal.toLocaleString("en-IN")}</td>
        </tr>
        <!-- Shipping -->
        <tr style="background:${C.body};">
          <td colspan="2" style="padding:10px 8px;font-size:13px;color:${C.muted};text-align:right;font-family:Arial,sans-serif;">Shipping</td>
          <td style="padding:10px 8px;font-size:13px;text-align:right;font-family:Arial,sans-serif;${order.shippingCost === 0 ? `color:${C.success};font-weight:bold;` : `color:${C.bodyText};`}">
            ${order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost.toLocaleString("en-IN")}`}
          </td>
        </tr>
        <!-- Grand Total -->
        <tr style="background:${C.card};">
          <td colspan="2" style="padding:14px 8px;font-size:15px;font-weight:bold;color:${C.heading};text-align:right;font-family:Arial,sans-serif;border-top:2px solid ${C.border};">Grand Total</td>
          <td style="padding:14px 8px;font-size:18px;font-weight:bold;color:${C.primary};text-align:right;font-family:Arial,sans-serif;border-top:2px solid ${C.border};">₹${order.totalAmount.toLocaleString("en-IN")}</td>
        </tr>
      </tbody>
    </table>

    <!-- Payment + Delivery info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <!-- Delivery address -->
        <td width="55%" style="vertical-align:top;padding-right:12px;">
          <div style="background:${C.card};border:1px solid ${C.border};border-radius:4px;padding:16px;">
            <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;font-weight:bold;">Delivering To</p>
            <p style="margin:0;font-size:14px;color:${C.heading};font-family:Arial,sans-serif;font-weight:bold;">${addr.fullName}</p>
            <p style="margin:4px 0 0 0;font-size:13px;color:${C.bodyText};font-family:Arial,sans-serif;line-height:1.5;">${addressLine}</p>
            <p style="margin:4px 0 0 0;font-size:13px;color:${C.muted};font-family:Arial,sans-serif;">📞 ${addr.phone}</p>
          </div>
        </td>
        <!-- Payment method -->
        <td width="45%" style="vertical-align:top;">
          <div style="background:${C.card};border:1px solid ${C.border};border-radius:4px;padding:16px;">
            <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;font-weight:bold;">Payment</p>
            <p style="margin:0 0 8px 0;">${paymentBadge}</p>
            <p style="margin:4px 0 0 0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;font-weight:bold;margin-top:12px;">Status</p>
            <p style="margin:4px 0 0 0;font-size:13px;color:${C.bodyText};font-family:Arial,sans-serif;text-transform:capitalize;">${order.status}</p>
          </div>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin-top:8px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/user?tab=orders"
        style="display:inline-block;background:${C.primary};color:#ffffff;text-decoration:none;padding:14px 32px;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:bold;border-radius:2px;">
        Track Your Order →
      </a>
    </div>

    <p style="margin:28px 0 0 0;font-size:13px;color:${C.muted};font-family:Arial,sans-serif;text-align:center;line-height:1.6;">
      Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/contact" style="color:${C.primary};text-decoration:none;">contact page</a>.
    </p>
  `;

  return emailWrapper(siteName, content);
}

// ─── Order Status Update Email ────────────────────────────────────────────────
export function orderStatusEmail(
  order: {
    _id: string;
    status: string;
    shippingAddress: { fullName: string };
    totalAmount: number;
  },
  siteName = "Heritage Threads"
): string {
  const orderId = order._id.toString().slice(-8).toUpperCase();

  const statusConfig: Record<string, { icon: string; title: string; message: string; color: string; bg: string }> = {
    processing: {
      icon: "⚙️",
      title: "Order Being Processed",
      message: "Your order is being carefully prepared by our artisans. We'll notify you as soon as it ships.",
      color: C.primary,
      bg: "#fff3f2",
    },
    shipped: {
      icon: "🚚",
      title: "Your Order Has Shipped!",
      message: "Great news! Your artisanal piece is on its way to you. Expect delivery within 3–7 business days.",
      color: "#1a6fa8",
      bg: "#e8f4fd",
    },
    delivered: {
      icon: "✅",
      title: "Order Delivered",
      message: "Your order has been delivered. We hope you love your handcrafted piece as much as we loved making it!",
      color: C.success,
      bg: "#f0f7f0",
    },
    cancelled: {
      icon: "❌",
      title: "Order Cancelled",
      message: "Your order has been cancelled. If you have any questions or need assistance, please don't hesitate to contact us.",
      color: "#c0392b",
      bg: "#fdf0f0",
    },
  };

  const cfg = statusConfig[order.status] ?? {
    icon: "📦",
    title: "Order Update",
    message: "Your order status has been updated.",
    color: C.primary,
    bg: C.card,
  };

  const content = `
    <!-- Status banner -->
    <div style="background:${cfg.bg};border:1px solid ${cfg.color}33;border-radius:4px;padding:20px 24px;margin-bottom:28px;text-align:center;">
      <div style="font-size:36px;margin-bottom:8px;">${cfg.icon}</div>
      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:normal;color:${cfg.color};font-family:'Georgia',serif;">${cfg.title}</h2>
      <p style="margin:0;font-size:14px;color:${C.bodyText};font-family:Arial,sans-serif;line-height:1.6;">${cfg.message}</p>
    </div>

    <!-- Greeting -->
    <p style="margin:0 0 20px 0;font-size:15px;color:${C.bodyText};font-family:Arial,sans-serif;line-height:1.6;">
      Hi <strong>${order.shippingAddress.fullName}</strong>,
    </p>

    <!-- Order summary card -->
    <div style="background:${C.card};border:1px solid ${C.border};border-radius:4px;padding:20px 24px;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;font-weight:bold;padding-bottom:8px;">Order Number</td>
          <td style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;font-weight:bold;padding-bottom:8px;text-align:right;">Order Total</td>
        </tr>
        <tr>
          <td style="font-size:18px;color:${C.heading};font-family:'Georgia',serif;font-weight:bold;">#${orderId}</td>
          <td style="font-size:18px;color:${C.primary};font-family:'Georgia',serif;font-weight:bold;text-align:right;">₹${order.totalAmount.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top:12px;border-top:1px solid ${C.border};margin-top:12px;">
            <span style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;font-weight:bold;">Current Status: </span>
            <span style="font-size:13px;color:${cfg.color};font-family:Arial,sans-serif;font-weight:bold;text-transform:capitalize;">${order.status}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:8px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/user?tab=orders"
        style="display:inline-block;background:${C.primary};color:#ffffff;text-decoration:none;padding:14px 32px;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:bold;border-radius:2px;">
        View Order Details →
      </a>
    </div>

    <p style="margin:24px 0 0 0;font-size:13px;color:${C.muted};font-family:Arial,sans-serif;text-align:center;line-height:1.6;">
      Need help? <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/contact" style="color:${C.primary};text-decoration:none;">Contact our support team</a>
    </p>
  `;

  return emailWrapper(siteName, content);
}

// ─── Contact Notification Email (to admin) ────────────────────────────────────
export function contactNotificationEmail(
  contact: { name: string; email: string; message: string },
  siteName = "Heritage Threads"
): string {
  const content = `
    <div style="background:${C.card};border-left:4px solid ${C.primary};padding:16px 20px;margin-bottom:24px;border-radius:0 4px 4px 0;">
      <p style="margin:0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;font-weight:bold;">New Contact Message</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;font-weight:bold;width:100px;">From</td>
        <td style="padding:8px 0;font-size:14px;color:${C.heading};font-family:Arial,sans-serif;font-weight:bold;">${contact.name}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;font-weight:bold;">Email</td>
        <td style="padding:8px 0;font-size:14px;font-family:Arial,sans-serif;">
          <a href="mailto:${contact.email}" style="color:${C.primary};text-decoration:none;">${contact.email}</a>
        </td>
      </tr>
    </table>

    <div style="background:${C.body};border:1px solid ${C.border};border-radius:4px;padding:20px;margin-bottom:28px;">
      <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};font-family:Arial,sans-serif;font-weight:bold;">Message</p>
      <p style="margin:0;font-size:14px;color:${C.bodyText};font-family:Arial,sans-serif;line-height:1.7;white-space:pre-wrap;">${contact.message}</p>
    </div>

    <div style="text-align:center;">
      <a href="mailto:${contact.email}?subject=Re: Your message to ${siteName}"
        style="display:inline-block;background:${C.primary};color:#ffffff;text-decoration:none;padding:12px 28px;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:bold;border-radius:2px;margin-right:12px;">
        Reply to ${contact.name}
      </a>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/admin/contacts"
        style="display:inline-block;background:transparent;color:${C.primary};text-decoration:none;padding:12px 28px;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:bold;border-radius:2px;border:1px solid ${C.primary};">
        View in Admin
      </a>
    </div>
  `;

  return emailWrapper(siteName, content);
}
