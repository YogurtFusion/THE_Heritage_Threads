# Heritage Threads

> A full-stack e-commerce platform for authentic Madhubani art — handcrafted products, seamless ordering, and a complete admin experience.

**Live Site** → [https://the-heritage-threads-369n.vercel.app](https://the-heritage-threads-369n.vercel.app)

---

## Overview

Heritage Threads is a production-ready e-commerce website built for a seller of traditional Madhubani art and handcrafted textiles. The platform handles the full buying journey — from product browsing to payment — along with an admin panel for order and inventory management.

---

## Features

### Customer-Facing

- Browse and filter handcrafted product catalog
- Product detail pages with image galleries
- Cart and checkout flow
- Instamojo payment gateway integration
- Order confirmation and tracking

### Admin Panel

- Manage products (add, edit, delete)
- View and update order statuses
- Dashboard overview of store activity

---

## Tech Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Frontend   | Next.js, Tailwind CSS v4 |
| Backend    | Node.js, Express         |
| Database   | MongoDB                  |
| Auth       | JWT                      |
| Payments   | Instamojo                |
| Deployment | Vercel (frontend)        |

---

## Design System

- **Palette** — Terracotta, cream, and warm neutrals inspired by traditional Madhubani artwork
- **Typography** — Playfair Display (headings) + Inter (body)
- **Philosophy** — Cultural authenticity reflected through editorial, craft-forward UI

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Instamojo API credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/YogurtFusion/THE_Heritage_Threads.git
cd THE_Heritage_Threads

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your MongoDB URI, JWT secret, and Instamojo keys
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
INSTAMOJO_API_KEY=your_instamojo_api_key
INSTAMOJO_AUTH_TOKEN=your_instamojo_auth_token
NEXT_PUBLIC_API_URL=your_backend_api_url
```

---

## Project Structure

```
/
├── app/                  # Next.js app directory
│   ├── (store)/          # Customer-facing routes
│   └── admin/            # Admin panel routes
├── components/           # Reusable UI components
├── lib/                  # Utilities and helpers
├── public/               # Static assets
└── styles/               # Global styles
```

---

## Collaboration

This project was built by two developers working across a shared Git/GitHub workflow.

| Role                                                            | Responsibility                                            |
| --------------------------------------------------------------- | --------------------------------------------------------- |
| Frontend ([@YogurtFusion](https://github.com/YogurtFusion))| UI/UX design, frontend development            |
| Backend ([@ankitkushwaha-ank](https://github.com/ankitkushwaha-ank)) | Database architecture, backend API, server infrastructure |

---

## Deployment Notes

Deployed on Vercel. One known gotcha during build:

> **`jsconfig.json` must include `baseUrl` set to `"."` for path aliases to resolve correctly on Vercel.** Without this, the build fails silently on import resolution.

```json
{
  "compilerOptions": {
    "baseUrl": "."
  }
}
```

---

## License

This project was built for a private client. All rights reserved.
