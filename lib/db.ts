/**
 * Unified data access layer — MongoDB + SQLite + MySQL.
 * All API routes should use these functions instead of Mongoose directly.
 */
import dbConnect, { detectDbType, getDbUri, sqliteDb } from "@/lib/dbConnect";
import crypto from "crypto";

function newId(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isSQLite() { return detectDbType(getDbUri()) === "sqlite"; }

function sqliteOrderToApi(o: Record<string, unknown>, users?: Record<string, unknown>[]) {
  const user = users?.find((u) => u.id === o.user_id);
  return {
    _id: o.id,
    userId: user ? { _id: user.id, name: user.name, email: user.email } : o.user_id,
    items: JSON.parse((o.items as string) || "[]"),
    totalAmount: o.total_amount,
    status: o.status,
    paymentId: o.payment_id,
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method,
    paymentScreenshot: o.payment_screenshot,
    shippingAddress: JSON.parse((o.shipping_address as string) || "{}"),
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}

function sqliteUserToApi(u: Record<string, unknown>) {
  return { _id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar, createdAt: u.created_at };
}

function sqliteNotifToApi(n: Record<string, unknown>) {
  return {
    _id: n.id, type: n.type, title: n.title, message: n.message,
    link: n.link, read: Boolean(n.read),
    data: JSON.parse((n.data as string) || "{}"),
    createdAt: n.created_at,
  };
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function getPublicSettings() {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const row = db.prepare("SELECT * FROM settings WHERE id = 'main'").get() as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      siteName: row.site_name, logo: row.logo, banner: row.banner, favicon: row.favicon,
      currency: row.currency, contactEmail: row.contact_email, contactPhone: row.contact_phone,
      contactAddress: row.contact_address,
      socialLinks: JSON.parse((row.social_links as string) || "{}"),
      codEnabled: Boolean(row.cod_enabled), onlinePaymentEnabled: Boolean(row.online_payment_enabled),
      qrEnabled: Boolean(row.qr_enabled), qrRecipientName: row.qr_recipient_name,
      qrUpiId: row.qr_upi_id, qrImage: row.qr_image,
      paymentGateway: row.payment_gateway || "instamojo",
      freeShippingAbove: Number(row.free_shipping_above) || 500,
      shippingCharge: Number(row.shipping_charge) || 50,
    };
  }
  const Settings = (await import("@/models/Settings")).default;
  return Settings.findOne({})
    .select("siteName logo banner favicon socialLinks contactEmail contactPhone contactAddress codEnabled onlinePaymentEnabled freeShippingAbove shippingCharge paymentGateway qrEnabled qrRecipientName qrUpiId qrImage")
    .lean();
}

export async function getAllSettings() {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const row = db.prepare("SELECT * FROM settings WHERE id = 'main'").get() as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      siteName: row.site_name, logo: row.logo, banner: row.banner, favicon: row.favicon,
      currency: row.currency, contactEmail: row.contact_email, contactPhone: row.contact_phone,
      contactAddress: row.contact_address,
      socialLinks: JSON.parse((row.social_links as string) || "{}"),
      codEnabled: Boolean(row.cod_enabled), onlinePaymentEnabled: Boolean(row.online_payment_enabled),
      qrEnabled: Boolean(row.qr_enabled), qrRecipientName: row.qr_recipient_name,
      qrUpiId: row.qr_upi_id, qrImage: row.qr_image,
      paymentGateway: row.payment_gateway, cashfreeEnv: row.cashfree_env,
      cashfreeAppId: row.cashfree_app_id, cashfreeSecretKey: row.cashfree_secret_key,
      instaMojoApiKey: row.instamojo_api_key, instaMojoAuthToken: row.instamojo_auth_token,
      instaMojoSalt: row.instamojo_salt,
      freeShippingAbove: Number(row.free_shipping_above), shippingCharge: Number(row.shipping_charge),
      returnPolicy: row.return_policy, privacyPolicy: row.privacy_policy,
      termsConditions: row.terms_conditions, aboutText: row.about_text,
      setupComplete: Boolean(row.setup_complete),
    };
  }
  const Settings = (await import("@/models/Settings")).default;
  return Settings.findOne({}).lean();
}

export async function updateSettings(updates: Record<string, unknown>) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const colMap: Record<string, string> = {
      siteName: "site_name", contactEmail: "contact_email", contactPhone: "contact_phone",
      contactAddress: "contact_address", codEnabled: "cod_enabled", onlinePaymentEnabled: "online_payment_enabled",
      qrEnabled: "qr_enabled", qrRecipientName: "qr_recipient_name", qrUpiId: "qr_upi_id",
      qrImage: "qr_image", freeShippingAbove: "free_shipping_above", shippingCharge: "shipping_charge",
      paymentGateway: "payment_gateway", setupComplete: "setup_complete",
      logo: "logo", banner: "banner", favicon: "favicon", currency: "currency",
      instaMojoApiKey: "instamojo_api_key", instaMojoAuthToken: "instamojo_auth_token",
      instaMojoSalt: "instamojo_salt", cashfreeAppId: "cashfree_app_id",
      cashfreeSecretKey: "cashfree_secret_key", cashfreeEnv: "cashfree_env",
      returnPolicy: "return_policy", privacyPolicy: "privacy_policy",
      termsConditions: "terms_conditions", aboutText: "about_text",
    };
    const setClauses: string[] = [];
    const values: unknown[] = [];
    for (const [key, val] of Object.entries(updates)) {
      if (key === "socialLinks") {
        setClauses.push("social_links = ?");
        values.push(JSON.stringify(val));
      } else if (colMap[key]) {
        setClauses.push(`${colMap[key]} = ?`);
        values.push(typeof val === "boolean" ? (val ? 1 : 0) : val);
      }
    }
    if (setClauses.length > 0) {
      setClauses.push("updated_at = ?");
      values.push(now(), "main");
      db.prepare(`UPDATE settings SET ${setClauses.join(", ")} WHERE id = ?`).run(...values);
    }
    return getAllSettings();
  }
  const Settings = (await import("@/models/Settings")).default;
  const mongoUpdates: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(updates)) {
    if (key === "socialLinks" && typeof val === "object" && val !== null) {
      for (const [sk, sv] of Object.entries(val as Record<string, string>)) {
        mongoUpdates[`socialLinks.${sk}`] = sv;
      }
    } else {
      mongoUpdates[key] = val;
    }
  }
  return Settings.findOneAndUpdate({}, { $set: mongoUpdates }, { new: true, upsert: true });
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getProducts(filters: { category?: string; search?: string; featured?: boolean; trending?: boolean; page?: number; limit?: number } = {}) {
  await dbConnect();
  const { category, search, featured, trending, page = 1, limit = 20 } = filters;
  if (isSQLite()) {
    const db = sqliteDb!;
    let where = "WHERE 1=1";
    const params: unknown[] = [];
    if (category) { where += " AND category = ?"; params.push(category); }
    if (featured) { where += " AND is_featured = 1"; }
    if (trending) { where += " AND is_trending = 1"; }
    if (search) { where += " AND (name LIKE ? OR description LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    const total = (db.prepare(`SELECT COUNT(*) as c FROM products ${where}`).get(...params) as { c: number }).c;
    const offset = (page - 1) * limit;
    const rows = db.prepare(`SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset) as Record<string, unknown>[];
    const products = rows.map((r) => ({
      _id: r.id, name: r.name, slug: r.slug, description: r.description,
      price: r.price, discountPrice: r.discount_price,
      images: JSON.parse((r.images as string) || "[]"),
      category: r.category, stock: r.stock,
      isFeatured: Boolean(r.is_featured), isTrending: Boolean(r.is_trending), createdAt: r.created_at,
    }));
    return { products, total, page, pages: Math.ceil(total / limit) };
  }
  const Product = (await import("@/models/Product")).default;
  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (featured) filter.isFeatured = true;
  if (trending) filter.isTrending = true;
  if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  return { products, total, page, pages: Math.ceil(total / limit) };
}

export async function getProductById(id: string) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      _id: row.id, name: row.name, slug: row.slug, description: row.description,
      price: row.price, discountPrice: row.discount_price,
      images: JSON.parse((row.images as string) || "[]"),
      category: row.category, stock: row.stock,
      isFeatured: Boolean(row.is_featured), isTrending: Boolean(row.is_trending),
    };
  }
  const Product = (await import("@/models/Product")).default;
  return Product.findById(id).lean();
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function getAllOrders() {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all() as Record<string, unknown>[];
    const users = db.prepare("SELECT id, name, email FROM users").all() as Record<string, unknown>[];
    return orders.map((o) => sqliteOrderToApi(o, users));
  }
  const Order = (await import("@/models/Order")).default;
  return Order.find({}).populate("userId", "name email").sort({ createdAt: -1 }).lean();
}

export async function getUserOrders(userId: string) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(userId) as Record<string, unknown>[];
    return orders.map((o) => sqliteOrderToApi(o));
  }
  const Order = (await import("@/models/Order")).default;
  return Order.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function createOrder(data: {
  userId: string; items: unknown[]; totalAmount: number;
  shippingAddress: unknown; paymentId?: string; paymentStatus?: string; paymentMethod?: string;
}) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const id = newId();
    db.prepare(`
      INSERT INTO orders (id, user_id, items, total_amount, status, payment_id, payment_status, payment_method, shipping_address, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.userId, JSON.stringify(data.items), data.totalAmount,
      data.paymentId ?? null, data.paymentStatus ?? "pending", data.paymentMethod ?? "cod",
      JSON.stringify(data.shippingAddress), now(), now()
    );
    const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Record<string, unknown>;
    return sqliteOrderToApi(row);
  }
  const Order = (await import("@/models/Order")).default;
  return Order.create({
    userId: data.userId, items: data.items, totalAmount: data.totalAmount,
    shippingAddress: data.shippingAddress, paymentId: data.paymentId ?? null,
    paymentStatus: data.paymentStatus ?? "pending", status: "pending",
  });
}

export async function updateOrderStatus(id: string, status: string) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const extra = status === "delivered" ? ", payment_status = 'paid'" : "";
    db.prepare(`UPDATE orders SET status = ?${extra}, updated_at = ? WHERE id = ?`).run(status, now(), id);
    const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    const users = db.prepare("SELECT id, name, email FROM users").all() as Record<string, unknown>[];
    return sqliteOrderToApi(row, users);
  }
  const Order = (await import("@/models/Order")).default;
  return Order.findByIdAndUpdate(
    id,
    { status, ...(status === "delivered" ? { paymentStatus: "paid" } : {}) },
    { new: true }
  ).populate("userId", "name email");
}

export async function updateOrderScreenshot(id: string, screenshotPath: string) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    db.prepare("UPDATE orders SET payment_screenshot = ?, payment_method = 'qr', payment_status = 'pending', updated_at = ? WHERE id = ?").run(screenshotPath, now(), id);
    const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    return row ? sqliteOrderToApi(row) : null;
  }
  const Order = (await import("@/models/Order")).default;
  return Order.findByIdAndUpdate(id, { paymentScreenshot: screenshotPath, paymentMethod: "qr", paymentStatus: "pending" }, { new: true });
}

export async function verifyOrderPayment(id: string, action: "verify" | "decline") {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    if (action === "verify") {
      db.prepare("UPDATE orders SET payment_status = 'paid', status = 'processing', updated_at = ? WHERE id = ?").run(now(), id);
    } else {
      db.prepare("UPDATE orders SET payment_status = 'pending', payment_method = 'cod', payment_screenshot = NULL, status = 'pending', updated_at = ? WHERE id = ?").run(now(), id);
    }
    const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    return row ? sqliteOrderToApi(row) : null;
  }
  const Order = (await import("@/models/Order")).default;
  const order = await Order.findById(id);
  if (!order) return null;
  if (action === "verify") { order.paymentStatus = "paid"; order.status = "processing"; }
  else { order.paymentStatus = "pending"; (order as Record<string, unknown>).paymentMethod = "cod"; order.paymentScreenshot = undefined; order.status = "pending"; }
  await order.save();
  return order;
}

export async function getOrderById(id: string) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    const users = db.prepare("SELECT id, name, email FROM users").all() as Record<string, unknown>[];
    return sqliteOrderToApi(row, users);
  }
  const Order = (await import("@/models/Order")).default;
  return Order.findById(id).populate("userId", "name email");
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function getAllUsers() {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const rows = db.prepare("SELECT * FROM users ORDER BY created_at DESC").all() as Record<string, unknown>[];
    return rows.map(sqliteUserToApi);
  }
  const User = (await import("@/models/User")).default;
  return User.find({}).select("-password").sort({ createdAt: -1 }).lean();
}

export async function updateUserRole(userId: string, role: string) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    db.prepare("UPDATE users SET role = ?, updated_at = ? WHERE id = ?").run(role, now(), userId);
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as Record<string, unknown> | undefined;
    return row ? sqliteUserToApi(row) : null;
  }
  const User = (await import("@/models/User")).default;
  return User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
}

export async function getUserByEmail(email: string) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as Record<string, unknown> | undefined;
    return row ?? null;
  }
  const User = (await import("@/models/User")).default;
  return User.findOne({ email: email.toLowerCase() }).select("+password");
}

export async function createUser(data: { name: string; email: string; password: string; role?: string }) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const id = newId();
    db.prepare("INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      id, data.name, data.email.toLowerCase(), data.password, data.role ?? "user", now(), now()
    );
    return { _id: id, name: data.name, email: data.email, role: data.role ?? "user" };
  }
  const User = (await import("@/models/User")).default;
  return User.create(data);
}

export async function updateUserProfile(userId: string, name: string) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    db.prepare("UPDATE users SET name = ?, updated_at = ? WHERE id = ?").run(name, now(), userId);
    return { name };
  }
  const User = (await import("@/models/User")).default;
  return User.findByIdAndUpdate(userId, { name }, { new: true }).select("-password");
}

// ─── Contacts ─────────────────────────────────────────────────────────────────
export async function getAllContacts() {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const rows = db.prepare("SELECT * FROM contacts ORDER BY created_at DESC").all() as Record<string, unknown>[];
    return rows.map((r) => ({ _id: r.id, name: r.name, email: r.email, message: r.message, createdAt: r.created_at }));
  }
  const Contact = (await import("@/models/Contact")).default;
  return Contact.find({}).sort({ createdAt: -1 }).lean();
}

export async function createContact(data: { name: string; email: string; message: string }) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const id = newId();
    db.prepare("INSERT INTO contacts (id, name, email, message, created_at) VALUES (?, ?, ?, ?, ?)").run(id, data.name, data.email, data.message, now());
    return { _id: id, ...data, createdAt: now() };
  }
  const Contact = (await import("@/models/Contact")).default;
  return Contact.create(data);
}

export async function deleteContact(id: string) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    db.prepare("DELETE FROM contacts WHERE id = ?").run(id);
    return true;
  }
  const Contact = (await import("@/models/Contact")).default;
  await Contact.findByIdAndDelete(id);
  return true;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function getNotifications() {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const notifications = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50").all() as Record<string, unknown>[];
    const unreadCount = (db.prepare("SELECT COUNT(*) as c FROM notifications WHERE read = 0").get() as { c: number }).c;
    return { notifications: notifications.map(sqliteNotifToApi), unreadCount };
  }
  const Notification = (await import("@/models/Notification")).default;
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({}).sort({ createdAt: -1 }).limit(50).lean(),
    Notification.countDocuments({ read: false }),
  ]);
  return { notifications, unreadCount };
}

export async function markAllNotificationsRead() {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    db.prepare("UPDATE notifications SET read = 1").run();
    return true;
  }
  const Notification = (await import("@/models/Notification")).default;
  await Notification.updateMany({ read: false }, { read: true });
  return true;
}

export async function createNotificationRecord(data: {
  type: string; title: string; message: string; link?: string; data?: Record<string, unknown>;
}) {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const id = newId();
    db.prepare("INSERT INTO notifications (id, type, title, message, link, read, data, created_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)").run(
      id, data.type, data.title, data.message, data.link ?? null, JSON.stringify(data.data ?? {}), now()
    );
    return true;
  }
  const Notification = (await import("@/models/Notification")).default;
  await Notification.create(data);
  return true;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboardData() {
  await dbConnect();
  if (isSQLite()) {
    const db = sqliteDb!;
    const todayStr = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const sevenDaysStr = sevenDaysAgo.toISOString().split("T")[0];

    const totalOrders = (db.prepare("SELECT COUNT(*) as c FROM orders").get() as { c: number }).c;
    const totalRevenue = (db.prepare("SELECT COALESCE(SUM(total_amount), 0) as t FROM orders WHERE payment_status = 'paid'").get() as { t: number }).t;
    const newUsersToday = (db.prepare("SELECT COUNT(*) as c FROM users WHERE date(created_at) = date('now')").get() as { c: number }).c;

    const recentOrderRows = db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5").all() as Record<string, unknown>[];
    const users = db.prepare("SELECT id, name, email FROM users").all() as Record<string, unknown>[];
    const recentOrders = recentOrderRows.map((o) => sqliteOrderToApi(o, users));

    const lowStockRows = db.prepare("SELECT * FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 10").all() as Record<string, unknown>[];
    const lowStockProducts = lowStockRows.map((r) => ({
      _id: r.id, name: r.name, stock: r.stock, category: r.category,
      images: JSON.parse((r.images as string) || "[]"),
    }));

    // Daily sales chart
    const dailySalesChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const row = db.prepare(
        "SELECT COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as orders FROM orders WHERE payment_status = 'paid' AND date(created_at) = ?"
      ).get(dateStr) as { revenue: number; orders: number };
      dailySalesChart.push({ date: dateStr, revenue: row.revenue, orders: row.orders });
    }

    return { totalOrders, totalRevenue, newUsersToday, dailySalesChart, recentOrders, lowStockProducts };
  }

  // MongoDB
  const Order = (await import("@/models/Order")).default;
  const User = (await import("@/models/User")).default;
  const Product = (await import("@/models/Product")).default;

  const now2 = new Date();
  const todayStart = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate());
  const sevenDaysAgo2 = new Date(todayStart);
  sevenDaysAgo2.setDate(sevenDaysAgo2.getDate() - 6);

  const [totalOrders, revenueAgg, newUsersToday, recentOrders, lowStockProducts, dailySalesRaw] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    User.countDocuments({ createdAt: { $gte: todayStart } }),
    Order.find({}).populate("userId", "name email").sort({ createdAt: -1 }).limit(5).lean(),
    Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(10).lean(),
    Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo2 }, paymentStatus: "paid" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const dailySalesChart = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = dailySalesRaw.find((r) => r._id === dateStr);
    dailySalesChart.push({ date: dateStr, revenue: found?.revenue ?? 0, orders: found?.orders ?? 0 });
  }

  return { totalOrders, totalRevenue: revenueAgg[0]?.total ?? 0, newUsersToday, dailySalesChart, recentOrders, lowStockProducts };
}
