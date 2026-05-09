import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uri, type } = body;

    if (!uri?.trim()) {
      return NextResponse.json({ success: false, data: null, message: "URI is required" }, { status: 400 });
    }

    const dbType = type ?? (
      uri.startsWith("mongodb") ? "mongodb" :
      uri.startsWith("mysql") ? "mysql" :
      (uri.startsWith("file:") || uri.endsWith(".db")) ? "sqlite" :
      "mongodb"
    );

    // ── MongoDB ──────────────────────────────────────────────────────────────
    if (dbType === "mongodb") {
      try {
        const mongoose = await import("mongoose");
        const conn = mongoose.default.createConnection(uri.trim(), {
          bufferCommands: false,
          serverSelectionTimeoutMS: 6000,
          connectTimeoutMS: 6000,
        });
        await conn.asPromise();
        await conn.close();
        return NextResponse.json({
          success: true,
          data: { type: "mongodb" },
          message: "MongoDB connected successfully! All collections will be created automatically.",
        });
      } catch (err) {
        return NextResponse.json(
          { success: false, data: null, message: `MongoDB failed: ${(err as Error).message}` },
          { status: 400 }
        );
      }
    }

    // ── SQLite ────────────────────────────────────────────────────────────────
    if (dbType === "sqlite") {
      try {
        const Database = (await import("better-sqlite3")).default;
        const filePath = uri.replace(/^file:/, "");
        const db = new Database(filePath);
        db.pragma("journal_mode = WAL");

        // Create all tables
        db.exec(`
          CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'user', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
          CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT, slug TEXT UNIQUE, description TEXT, price REAL, category TEXT, stock INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
          CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, user_id TEXT, items TEXT, total_amount REAL, status TEXT DEFAULT 'pending', payment_method TEXT DEFAULT 'cod', payment_status TEXT DEFAULT 'pending', payment_screenshot TEXT, shipping_address TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
          CREATE TABLE IF NOT EXISTS contacts (id TEXT PRIMARY KEY, name TEXT, email TEXT, message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
          CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY DEFAULT 'main', site_name TEXT DEFAULT 'My Store', cod_enabled INTEGER DEFAULT 1, qr_enabled INTEGER DEFAULT 0, setup_complete INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
          CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, type TEXT, title TEXT, message TEXT, link TEXT, read INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
          INSERT OR IGNORE INTO settings (id) VALUES ('main');
        `);

        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
        db.close();

        return NextResponse.json({
          success: true,
          data: { type: "sqlite", tables: tables.map((t) => t.name) },
          message: `SQLite connected! Created ${tables.length} tables: ${tables.map((t) => t.name).join(", ")}`,
        });
      } catch (err) {
        return NextResponse.json(
          { success: false, data: null, message: `SQLite failed: ${(err as Error).message}` },
          { status: 400 }
        );
      }
    }

    // ── MySQL ─────────────────────────────────────────────────────────────────
    if (dbType === "mysql") {
      try {
        const mysql = await import("mysql2/promise");
        const url = new URL(uri.trim().replace("mysql2://", "mysql://"));
        const conn = await mysql.createConnection({
          host: url.hostname,
          port: parseInt(url.port || "3306"),
          user: url.username,
          password: url.password,
          database: url.pathname.slice(1),
          connectTimeout: 6000,
        });

        // Create all tables
        const tables = [
          `CREATE TABLE IF NOT EXISTS users (id VARCHAR(36) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password VARCHAR(255), role ENUM('admin','user') DEFAULT 'user', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
          `CREATE TABLE IF NOT EXISTS products (id VARCHAR(36) PRIMARY KEY, name VARCHAR(255), slug VARCHAR(255) UNIQUE, description TEXT, price DECIMAL(10,2), category VARCHAR(100), stock INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
          `CREATE TABLE IF NOT EXISTS orders (id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36), items JSON, total_amount DECIMAL(10,2), status VARCHAR(50) DEFAULT 'pending', payment_method VARCHAR(50) DEFAULT 'cod', payment_status VARCHAR(50) DEFAULT 'pending', payment_screenshot TEXT, shipping_address JSON, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
          `CREATE TABLE IF NOT EXISTS contacts (id VARCHAR(36) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
          `CREATE TABLE IF NOT EXISTS settings (id VARCHAR(36) PRIMARY KEY, site_name VARCHAR(255) DEFAULT 'My Store', cod_enabled TINYINT(1) DEFAULT 1, qr_enabled TINYINT(1) DEFAULT 0, setup_complete TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
          `CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(36) PRIMARY KEY, type VARCHAR(50), title VARCHAR(255), message TEXT, link VARCHAR(500), read_status TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
          `INSERT IGNORE INTO settings (id) VALUES ('main')`,
        ];

        for (const sql of tables) {
          await conn.execute(sql);
        }

        await conn.end();

        return NextResponse.json({
          success: true,
          data: { type: "mysql" },
          message: `MySQL connected to ${url.hostname}! All tables created successfully.`,
        });
      } catch (err) {
        return NextResponse.json(
          { success: false, data: null, message: `MySQL failed: ${(err as Error).message}. Make sure mysql2 is installed: npm install mysql2` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: false, data: null, message: "Unsupported database type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, data: null, message: (error as Error).message }, { status: 500 });
  }
}
