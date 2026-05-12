import Link from "next/link";

export const metadata = { title: "Help & Documentation" };

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    content: [
      {
        q: "How do I create an account?",
        a: "Click Sign up in the top navigation bar. Enter your name, email address, and a password (minimum 6 characters). You'll be automatically signed in after registration.",
      },
      {
        q: "How do I sign in?",
        a: "Click Sign in in the navigation bar. Enter your email and password. If you forgot your password, contact support.",
      },
      {
        q: "Is my information secure?",
        a: "Yes. Passwords are encrypted using bcrypt. Payment information is handled by secure payment gateways (Instamojo/Cashfree) — we never store your card details.",
      },
    ],
  },
  {
    id: "shopping",
    title: "Shopping",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    content: [
      {
        q: "How do I browse products?",
        a: "Click Products in the navigation or visit the Collection page. Use the category filters on the left to narrow down by Keychains, Zip Chains, etc. Use the search bar at the top to search by name.",
      },
      {
        q: "How do I add items to my cart?",
        a: "Click the Add to Cart button on any product card or product detail page. You can adjust the quantity on the product page before adding.",
      },
      {
        q: "Can I see a product up close?",
        a: "Yes! Click on any product to open its detail page. You'll see multiple images, full description, stock status, and pricing. Hover over product cards to see an alternate view.",
      },
      {
        q: "How do I search for products?",
        a: "Click the search icon in the navigation bar and type your query. Press Enter or click the search icon to see results on the Collection page.",
      },
    ],
  },
  {
    id: "cart-checkout",
    title: "Cart & Checkout",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    content: [
      {
        q: "How do I view my cart?",
        a: "Click the cart icon in the navigation bar. You'll see all items, quantities, and the total. You can update quantities or remove items from the cart page.",
      },
      {
        q: "How does checkout work?",
        a: "Checkout has 2 steps: (1) Enter your shipping address — you can save addresses for future use. (2) Choose payment method — Cash on Delivery, UPI/QR, or Online Payment.",
      },
      {
        q: "What payment methods are accepted?",
        a: "Cash on Delivery (COD), UPI/QR Code payment (scan and pay with any UPI app), and Online Payment via Instamojo or Cashfree (cards, net banking, wallets).",
      },
      {
        q: "How does QR/UPI payment work?",
        a: "Select UPI/QR Code at checkout. Scan the QR code or copy the UPI ID. Pay using GPay, PhonePe, Paytm, or any UPI app. Take a screenshot of the payment confirmation and upload it. Your order will be confirmed after admin verification (usually within a few hours).",
      },
      {
        q: "Is shipping free?",
        a: "Shipping is free on orders above the free shipping threshold (shown at checkout). A standard shipping charge applies to smaller orders.",
      },
    ],
  },
  {
    id: "orders",
    title: "Orders & Tracking",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    content: [
      {
        q: "How do I track my order?",
        a: "Go to My Account → My Orders. Each order shows its current status: Pending → Processing → Shipped → Delivered. You'll also receive email notifications when your order status changes.",
      },
      {
        q: "What do the order statuses mean?",
        a: "Pending: Order received, awaiting processing. Processing: Order confirmed and being prepared. Shipped: Order dispatched and on its way. Delivered: Order delivered to you. Cancelled: Order was cancelled.",
      },
      {
        q: "Can I cancel my order?",
        a: "Contact us as soon as possible if you need to cancel. Orders that have already been shipped cannot be cancelled. Use the Contact page to reach us.",
      },
      {
        q: "I paid via UPI but my order shows pending payment. What do I do?",
        a: "After uploading your payment screenshot, the admin will verify it within a few hours. If it's been more than 24 hours, contact us with your order number and payment proof.",
      },
    ],
  },
  {
    id: "account",
    title: "My Account",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    content: [
      {
        q: "How do I update my profile?",
        a: "Go to My Account → Profile. Click the edit (pencil) icon to enable editing. Update your name and click Save Changes.",
      },
      {
        q: "How do I manage saved addresses?",
        a: "Saved addresses appear automatically at checkout. Up to 5 addresses are saved. New addresses are saved when you complete a checkout.",
      },
      {
        q: "My cart is empty after logging in. Why?",
        a: "Carts are linked to your account. If you added items while logged out, they won't transfer. Each account has its own cart stored securely.",
      },
    ],
  },
];

const adminSections = [
  {
    id: "admin-dashboard",
    title: "Dashboard",
    content: [
      { q: "What does the dashboard show?", a: "Total orders, total revenue (paid orders only), new users today, a 7-day sales chart, recent orders, and low stock alerts (products with 5 or fewer items)." },
      { q: "How often does the dashboard update?", a: "The dashboard fetches fresh data every time you visit. The notification bell polls every 30 seconds for new notifications." },
    ],
  },
  {
    id: "admin-products",
    title: "Managing Products",
    content: [
      { q: "How do I add a product?", a: "Go to Admin → Inventory → Add Product. Fill in the name, category, price, stock, description, and upload at least 2 images. The first image is the main image; the second is shown when customers hover over the product card." },
      { q: "Why are 2 images required?", a: "The second image creates a hover effect on product cards — when a customer hovers, the card smoothly transitions to the second image. This improves the shopping experience." },
      { q: "How do I edit a product?", a: "Go to Admin → Inventory, find the product, and click Edit. You can update all fields including images." },
      { q: "How do I delete a product?", a: "Click Delete on the product in the Inventory list. A confirmation toast will appear — click 'Yes, Delete' to confirm. This cannot be undone." },
      { q: "What happens to stock when an order is placed?", a: "Stock is automatically reduced by the ordered quantity when an order is created. If a product goes below 5 units, it appears in the Low Stock section on the dashboard." },
    ],
  },
  {
    id: "admin-orders",
    title: "Managing Orders",
    content: [
      { q: "How do I update an order status?", a: "Go to Admin → Orders. Find the order and use the status dropdown to change it. The customer receives an email notification automatically." },
      { q: "What happens when I mark an order as Delivered?", a: "The order status changes to Delivered and the payment status is automatically set to Paid (for COD orders). An email is sent to the customer." },
      { q: "How do I verify a QR/UPI payment?", a: "Go to Admin → Payment Receipts. Orders with uploaded screenshots appear here. Click the screenshot to enlarge it, then click Verify Payment or Decline. Verified orders move to Processing; declined orders revert to COD." },
    ],
  },
  {
    id: "admin-settings",
    title: "Settings",
    content: [
      { q: "How do I change the site name and logo?", a: "Go to Admin → Settings → Site Settings. Update the site name, upload a logo, banner, and favicon. Click Save Settings." },
      { q: "How do I set up payment gateways?", a: "Go to Admin → Settings → Payment. Enable COD, Online Payment, or QR/UPI. For online payment, choose Instamojo or Cashfree and enter your credentials. Use the Test Connection button to verify." },
      { q: "How do I set up QR/UPI payment?", a: "Go to Admin → Settings → Payment → QR/UPI Payment. Enable it, enter your UPI ID and recipient name, and upload your QR code image. Customers will see this at checkout." },
      { q: "How do I configure media storage?", a: "Go to Admin → Settings → Media Storage. Choose Local (development), Backblaze B2, or Cloudflare R2. Enter the credentials and click Test Connection to verify before saving." },
      { q: "How do I set up email notifications?", a: "Go to Admin → Settings → Notifications. Enter your Gmail address and App Password (generated at myaccount.google.com/apppasswords). Click Send Test Email to verify." },
      { q: "How do I add social media links?", a: "Go to Admin → Settings → Social Links. Enter URLs for Instagram, Facebook, Twitter/X, YouTube, Reddit, and WhatsApp. These appear in the footer." },
    ],
  },
  {
    id: "admin-media",
    title: "Media Storage Setup",
    content: [
      { q: "What is Backblaze B2?", a: "Backblaze B2 is affordable cloud storage at $0.006/GB/month. It uses an S3-compatible API. Get credentials at backblaze.com → B2 Cloud Storage → App Keys." },
      { q: "What is Cloudflare R2?", a: "Cloudflare R2 has zero egress fees and a global CDN. Get credentials at dash.cloudflare.com → R2 → Manage R2 API Tokens. You need the Endpoint URL from the API token page." },
      { q: "Why use cloud storage instead of local?", a: "Local storage files are lost when you redeploy your app. Cloud storage persists permanently and is accessible globally with fast CDN delivery." },
    ],
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-body py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl text-heading font-bold mb-4">Help & Documentation</h1>
          <p className="text-body-text text-lg leading-relaxed">
            Everything you need to know about using Heritage Threads — for shoppers and store administrators.
          </p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { href: "#getting-started", label: "Getting Started" },
            { href: "#shopping", label: "Shopping" },
            { href: "#cart-checkout", label: "Checkout" },
            { href: "#orders", label: "Orders" },
          ].map((l) => (
            <a key={l.href} href={l.href}
              className="bg-card border border-border rounded-lg px-4 py-3 text-sm font-medium text-heading hover:text-primary hover:border-primary transition-colors text-center">
              {l.label}
            </a>
          ))}
        </div>

        {/* User docs */}
        <section className="mb-16">
          <h2 className="font-playfair text-2xl text-heading font-semibold mb-8 pb-3 border-b border-border">
            For Shoppers
          </h2>
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.id} id={section.id}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    {section.icon}
                  </div>
                  <h3 className="font-playfair text-xl text-heading font-semibold">{section.title}</h3>
                </div>
                <div className="space-y-4 pl-11">
                  {section.content.map((item, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-5">
                      <p className="font-semibold text-heading text-sm mb-2">{item.q}</p>
                      <p className="text-body-text text-sm leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Admin docs */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8 pb-3 border-b border-border">
            <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h2 className="font-playfair text-2xl text-heading font-semibold">For Administrators</h2>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-sm text-yellow-800">
            <strong>Admin access:</strong> Log in with your admin credentials at <Link href="/login" className="underline">/login</Link>. The admin panel is at <Link href="/admin" className="underline">/admin</Link>. Only users with the admin role can access it.
          </div>

          <div className="space-y-10">
            {adminSections.map((section) => (
              <div key={section.id} id={section.id}>
                <h3 className="font-playfair text-xl text-heading font-semibold mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block" />
                  {section.title}
                </h3>
                <div className="space-y-4 pl-5">
                  {section.content.map((item, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-5">
                      <p className="font-semibold text-heading text-sm mb-2">{item.q}</p>
                      <p className="text-body-text text-sm leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <h3 className="font-playfair text-xl text-heading font-semibold mb-3">Still need help?</h3>
          <p className="text-body-text text-sm mb-5">Can't find what you're looking for? Our team is happy to help.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm">
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
