<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge&logo=socket.io"/>
  <img src="https://img.shields.io/badge/License-Portfolio-f59e0b?style=for-the-badge"/>
</p>

<div align="center">
  <h1>🍽️ Tawla — Restaurant POS System</h1>
  <p><strong>A full-stack, multi-tenant, AI-powered Point of Sale system built specifically for Lebanese restaurants.</strong></p>
  <p>Real-time orders · Kitchen display · Delivery management · Live analytics · Tawla AI suggestions</p>
</div>

---

## 📌 About

**Tawla** (Arabic for "table") is a complete SaaS Restaurant Point of Sale platform built from scratch. It is not a generic POS adapted for food — it was designed around the actual daily workflow of a Lebanese restaurant, covering every role from the owner to the waiter to the kitchen staff to the delivery operator.

The system is multi-tenant, meaning a single deployment serves multiple restaurants simultaneously, with complete data isolation between them. Each restaurant has its own menu, staff, tables, orders, and analytics — they never see each other's data.

Built by **Abdallah Khatib** — a Computer Science graduate from Lebanese International University with 5+ years of real pharmacy experience, and the developer behind [PharmaCare](https://github.com/Abdallah-khatib-7/pharmacy-system).

---

## ✨ Key Features

### 🏢 Multi-Tenant SaaS Architecture
- A single deployment serves unlimited restaurants
- Complete data isolation — every table, order, and user is scoped to `restaurant_id`
- Restaurant owners apply online, you review and approve from your Super Admin panel
- One-time payment licensing model — no subscriptions

### 👑 Super Admin Platform
- Your personal command center, completely separate from restaurant staff
- Review all restaurant applications with full detail (owner info, restaurant info, staff distribution)
- Approve or reject applications with reason
- On approval: restaurant is created + owner account is auto-generated with a temporary password
- Track payment status (cash or card) — payment history never disappears
- Activate or deactivate any restaurant (requires reason, 2-step confirmation)
- View all active restaurants and their details

### 🍽️ Owner Dashboard
- Live revenue counter (animates as orders come in)
- Real-time floor plan showing every table's status (free / occupied / bill requested)
- Live order ticker with waiter name, table number, amount, and status
- Weekly revenue chart comparing dine-in vs delivery
- Top sellers list with animated progress bars
- Active orders, active tables, active deliveries — all live

### 📋 Menu Management
- Categories with custom display order
- Menu items with name, description, price, availability toggle
- Two views: Grid (by category) and Full Menu (all items grouped by category like a real menu)
- Toggle item availability without deleting it
- In-app confirm modals for deletions — no browser `alert()` anywhere
- Search across all menu items instantly

### 🪑 Tables Management
- Visual floor plan with color-coded status
- Click any table to open a detail panel showing:
  - Current order with all items and item-level status
  - Waiter name who took the order
  - Subtotal, discount (if applied by owner), and final total
  - Discount input with large-discount warning (>40% triggers confirmation, 100% triggers extra warning)
- Owner can change table status directly (free / occupied / bill requested)
- Discounts saved to database and reflected in reports
- Add or delete tables with confirmation

### 📦 Orders Management
- Full order history with search and filter by status
- Status badges: Pending, Preparing, Ready, Served, Cancelled
- Order detail modal showing all items, waiter, table, timestamps
- Discount display showing original total, discount percentage, and final total
- Owner can update order status for intervention

### 👥 Staff Management
- Add staff with role-based access (Owner, Waiter, Kitchen, Delivery Operator, Driver)
- Email domain auto-enforced from owner's domain — staff emails always match the restaurant
- Real-time online/offline status with glowing green dot
- Click any staff card to see full detail panel:
  - Role, vehicle info (for drivers), today's hours worked
  - Work schedule (Mon–Sun with custom hours)
  - Recent session history (login/logout times and durations)
- Set weekly schedules with toggle per day and time picker
- Reset any staff member's password directly
- Remove staff with 2-step confirmation
- Delivery staff require vehicle info: car type, color, plate number, ID, driver license

### 🚚 Delivery Management
- Create delivery orders with customer name, phone, address, and notes
- Browse full restaurant menu inline when creating an order
- Auto delivery fee: $3 under $60, free at $60+
- Assign available drivers (drivers tracked with active delivery count — max 4 simultaneous)
- Driver status: Available / On Road — updates automatically
- Real-time status flow: Pending → Preparing → Out for Delivery → Delivered / Cancelled
- Delivered and cancelled timestamps saved permanently
- Socket.io pushes all delivery updates to both owner and delivery operator screens instantly

### 📊 Reports
- Today's revenue (dine-in + delivery combined)
- Weekly revenue area chart with dine-in vs delivery breakdown
- Revenue by category — pie chart
- Top 10 best sellers with animated bar chart and full detail list
- Discount log — every discount applied, by who, on which table, original vs final total
- Total discounts given (impacts revenue accuracy)

### 🤖 Tawla AI
- Powered by OpenAI GPT-3.5
- Activated before a waiter sends an order
- Reads the restaurant's live menu (prices, categories, availability)
- Analyzes the current order and suggests exactly 3 complementary items
- Logic includes: food pairings, missing drink, missing dessert, popular combos
- Special rule: if order is $50–$59, AI prioritizes items that push total to $60 for free delivery
- Waiter can select 0, 1, 2, or all 3 suggestions — one tap adds to order
- Each restaurant's AI only knows their own menu

### 🧑‍🍳 Waiter Interface
- Mobile-first design, optimized for tablets
- Tables view with color-coded status — own active tables glow with amber highlight
- New order flow: select table → browse menu by category → add items with per-item kitchen notes
- Quantity controls with + / − buttons
- General order notes field
- AI suggestions button before sending (opens Tawla AI modal)
- Active order view when clicking occupied table:
  - See all ordered items with kitchen status (pending/preparing/ready)
  - Cancel individual items (only if still pending — cannot cancel if kitchen started)
  - Add more items to existing order
  - Add tip (quick % buttons: 5%, 10%, 15%, 20% or custom amount)
  - Request bill (marks table as bill requested, notifies kitchen)
  - Split bill (equal split by number of people OR assign each item to a person)
  - Print receipt (clean white receipt in browser print dialog)
  - Mark table as served (frees the table)
- My Orders view: see all today's orders with live status updates via Socket.io

### 🔴 Kitchen Display
- Dark, high-contrast display designed for kitchen screens
- Shows all active dine-in orders AND delivery orders in one grid
- Each order card shows: table number (or customer name for delivery), waiter, elapsed time
- Urgent alert: orders older than 15 minutes turn red with URGENT badge
- Tap any individual item to mark it as ready (strikethrough animation)
- Action buttons: Start Preparing → Mark Ready
- Real-time clock in header (live seconds)
- New order notification with bell alert banner
- Filter by: All, Pending, Preparing, Ready, Delivery
- Socket.io pushes new orders and status changes instantly — no refresh needed

### 🚗 Delivery Operator Interface
- Access to the full delivery management page
- Cannot access: dashboard financials, menu management, table management, staff, reports
- Creates delivery orders on behalf of customers who call in
- Assigns available drivers
- Manages the full delivery status flow
- Real-time updates via Socket.io

### 👤 Role System (5 Roles)

| Role | Access |
|------|--------|
| **Super Admin** | Your personal platform — all restaurants, applications, payments |
| **Owner** | Full restaurant control — dashboard, menu, tables, orders, staff, delivery, reports |
| **Waiter** | Tables, order taking, AI suggestions, split bill, tip, receipt printing |
| **Kitchen** | Real-time order display — dine-in and delivery, item marking |
| **Delivery Operator** | Delivery orders only — create, assign drivers, track status |
| **Driver** | Registered in system for assignment tracking — no system login required |

### 🔒 Security
- JWT authentication — all protected routes require valid token
- `restaurant_id` scoped on every single database query — impossible data leakage
- bcrypt password hashing (10 salt rounds)
- Rate limiting: 50 login attempts / 15 min, 500 API calls / 15 min, 10 applications / hour
- Global error handler — never exposes stack traces or SQL errors in production
- Input validation on all critical routes (express-validator)
- `.env` never committed — enforced via `.gitignore`
- SQL injection prevented via parameterized queries on every query
- CORS configured for frontend origin only
- Inactive restaurant blocked at login level

### ⚡ Real-Time (Socket.io)
- Every restaurant has its own Socket.io room (`kitchen_{restaurant_id}`)
- New dine-in order → kitchen sees it instantly
- New delivery order → kitchen and delivery operator see it instantly
- Order status changed → all relevant screens update
- Driver assigned → delivery operator screen updates without refresh
- Online/offline user tracking — stored in server memory, broadcast to restaurant room
- Bill requested → kitchen notified

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| MySQL2 | Database driver with promise support |
| Socket.io | Real-time bidirectional events |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| OpenAI SDK | Tawla AI suggestions |
| Nodemailer | Email notifications for new applications |
| express-validator | Input validation middleware |
| express-rate-limit | Brute force protection |
| helmet | Security HTTP headers |
| morgan | HTTP request logging |
| dotenv | Environment configuration |
| nodemon | Development auto-reload |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 (Vite) | UI framework |
| Tailwind CSS v4 | Utility styling |
| Framer Motion | Page transitions, spring animations, layout animations |
| Recharts | Revenue charts, best sellers bar chart, category pie chart |
| Lucide React | Icon library |
| Axios | HTTP client with auto token injection |
| Socket.io Client | Real-time connection |
| React Router v6 | Client-side routing |
| React Hot Toast | Toast notifications (styled to match dark theme) |

### Database
| Table | Purpose |
|-------|---------|
| `super_admins` | You — the software owner |
| `restaurant_applications` | Signup requests before approval |
| `restaurants` | Approved, active restaurants |
| `users` | All staff across all restaurants |
| `tables` | Restaurant floor tables |
| `categories` | Menu categories per restaurant |
| `menu_items` | Menu items per restaurant |
| `orders` | Dine-in orders (with discount, tip, bill_requested) |
| `order_items` | Individual items per order |
| `delivery_orders` | Delivery orders with full customer info |
| `delivery_order_items` | Individual items per delivery order |
| `work_sessions` | Login/logout tracking per staff member |
| `work_schedules` | Weekly schedule per staff member |

---

## 📁 Project Structure

```
restaurant-pos/
├── backend/
│   ├── database/
│   │   ├── init.sql              # Full database schema (13 tables)
│   │   ├── seed.sql              # Sample data (70 menu items, 10 tables)
│   │   └── delivery.sql          # Delivery system migration
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   ├── validate.js           # express-validator error formatter
│   │   ├── rateLimiter.js        # Rate limiting (login, API, applications)
│   │   └── errorHandler.js       # Global error handler (safe for production)
│   ├── routes/
│   │   ├── auth.js               # Single login endpoint for all 5 roles
│   │   ├── superadmin.js         # Super admin — applications, restaurants, payments
│   │   ├── applications.js       # Public restaurant application form
│   │   ├── categories.js         # Menu categories CRUD
│   │   ├── menu.js               # Menu items CRUD
│   │   ├── tables.js             # Restaurant tables CRUD + status
│   │   ├── orders.js             # Dine-in orders + discount + tip + bill + split
│   │   ├── delivery.js           # Delivery orders + driver tracking
│   │   ├── users.js              # Staff management + password change
│   │   ├── reports.js            # Analytics — summary, weekly, best sellers, categories
│   │   ├── ai.js                 # Tawla AI suggestions (OpenAI GPT-3.5)
│   │   ├── sessions.js           # Work session tracking (login/logout)
│   │   └── schedules.js          # Staff weekly schedules
│   ├── utils/
│   │   └── mailer.js             # Nodemailer — new application email notification
│   ├── database.js               # MySQL connection pool
│   ├── index.js                  # Express app + Socket.io server + online user tracking
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Auth provider (user, token, login, logout)
    │   │   └── SocketContext.jsx  # Socket.io provider (socketRef, onlineUsers, socketReady)
    │   ├── hooks/
    │   │   └── useAuth.js         # Auth hook
    │   ├── services/
    │   │   └── api.js             # Axios instance with auto token injection + 401 handler
    │   ├── pages/
    │   │   ├── Landing.jsx        # Public marketing page with Unsplash images
    │   │   ├── Login.jsx          # Single login — routes all roles to their interface
    │   │   ├── Register.jsx       # 4-step restaurant application form
    │   │   ├── SuperAdmin.jsx     # Super admin platform (4 tabs)
    │   │   ├── Dashboard.jsx      # Owner dashboard + FloatingNav + BottomNav
    │   │   ├── MenuManagement.jsx # Menu CRUD (grid + full menu views)
    │   │   ├── TablesManagement.jsx # Floor plan + order detail + discount
    │   │   ├── Orders.jsx         # Order monitoring + status update
    │   │   ├── Staff.jsx          # Staff management + schedules + online status
    │   │   ├── Delivery.jsx       # Delivery order management
    │   │   ├── Reports.jsx        # Analytics charts + discount log
    │   │   ├── WaiterView.jsx     # Waiter interface (tables, order taking, AI, receipt)
    │   │   └── KitchenDisplay.jsx # Real-time kitchen display
    │   └── App.jsx                # Routes with role-based guards + RoleRedirect
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- XAMPP (MySQL via XAMPP) or standalone MySQL
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Abdallah-khatib-7/restaurant-pos.git
cd restaurant-pos
```

### 2. Set Up the Database
Start MySQL, then run:
```bash
# On XAMPP (Windows)
/c/xampp/mysql/bin/mysql -u root -p < backend/database/init.sql
/c/xampp/mysql/bin/mysql -u root -p < backend/database/seed.sql
/c/xampp/mysql/bin/mysql -u root -p < backend/database/delivery.sql
```

### 3. Configure the Backend
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=restaurant_pos

JWT_SECRET=your_super_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=your_openai_api_key

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_TO=your_gmail@gmail.com

CLIENT_URL=http://localhost:5173
```

### 4. Create Your Super Admin Account
```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your_password', 10).then(h => console.log(h));"
```

Copy the hash, then run MySQL:
```sql
USE restaurant_pos;
INSERT INTO super_admins (name, email, password)
VALUES ('Your Name', 'you@example.com', 'PASTE_HASH_HERE');
```

### 5. Install and Run the Backend
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 6. Install and Run the Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### 7. Apply for a Restaurant
Go to `http://localhost:5173/register` and complete the 4-step application form.

Then log in as Super Admin and approve the application from the Super Admin panel.

---

## 📡 API Reference

### Authentication
```
POST   /api/auth/login                    Single login endpoint for all roles
```

### Super Admin
```
POST   /api/superadmin/login              Super admin login
GET    /api/superadmin/applications       All restaurant applications
GET    /api/superadmin/applications/:id   Single application detail
POST   /api/superadmin/applications/:id/approve   Approve (creates restaurant + owner account)
POST   /api/superadmin/applications/:id/reject    Reject with reason
GET    /api/superadmin/restaurants        All approved restaurants
PUT    /api/superadmin/restaurants/:id/toggle     Activate/deactivate restaurant
PUT    /api/superadmin/restaurants/:id/payment    Mark payment received (cash/card)
```

### Applications (Public)
```
POST   /api/applications                  Submit restaurant application
```

### Categories
```
GET    /api/categories                    All categories for the restaurant
POST   /api/categories                    Add category (owner only)
PUT    /api/categories/:id                Update category (owner only)
DELETE /api/categories/:id               Delete category (owner only)
```

### Menu
```
GET    /api/menu                          All menu items for the restaurant
GET    /api/menu/category/:categoryId     Items by category
POST   /api/menu                          Add item (owner only)
PUT    /api/menu/:id                      Update item (owner only)
DELETE /api/menu/:id                     Delete item (owner only)
```

### Tables
```
GET    /api/tables                        All tables for the restaurant
POST   /api/tables                        Add table (owner only)
PUT    /api/tables/:id/status             Update table status
DELETE /api/tables/:id                   Delete table (owner only)
```

### Orders
```
GET    /api/orders                        All orders for the restaurant
GET    /api/orders/kitchen/active         Active orders for kitchen display
GET    /api/orders/:id                    Single order with all items
POST   /api/orders                        Create order (waiter)
PUT    /api/orders/:id/status             Update order status
PUT    /api/orders/:id/discount           Apply discount (owner only, saved to DB)
PUT    /api/orders/:id/tip                Add customer tip
PUT    /api/orders/:id/request-bill       Request bill (updates table status)
POST   /api/orders/:id/items              Add more items to existing order
DELETE /api/orders/:orderId/items/:itemId Cancel individual item (pending only)
```

### Delivery
```
GET    /api/delivery                      All delivery orders (owner sees all, operator sees theirs)
GET    /api/delivery/drivers              All registered drivers with vehicle info
POST   /api/delivery                      Create delivery order
PUT    /api/delivery/:id/assign           Assign driver (checks 4-order limit)
PUT    /api/delivery/:id/status           Update delivery status
```

### Users / Staff
```
GET    /api/users                         All staff for the restaurant (owner only)
POST   /api/users                         Create staff account
PUT    /api/users/change-password         Change own password
PUT    /api/users/:id                     Update staff info
DELETE /api/users/:id                    Remove staff member
```

### Reports
```
GET    /api/reports/summary               Today's stats (revenue, orders, tables, deliveries)
GET    /api/reports/weekly                Last 7 days revenue (dine-in + delivery)
GET    /api/reports/best-sellers          Top 10 items by quantity sold
GET    /api/reports/by-category           Revenue breakdown by menu category
```

### Tawla AI
```
POST   /api/ai/suggest                    Get 3 AI suggestions based on current order
```

### Work Sessions & Schedules
```
GET    /api/sessions/today                Today's login sessions for all staff (owner only)
GET    /api/sessions/user/:userId         Session history for a specific user
POST   /api/sessions/login                Log login session (auto-called on auth)
POST   /api/sessions/logout               Log logout session
GET    /api/schedules/:userId             Get weekly schedule for a user
POST   /api/schedules/:userId             Save/replace weekly schedule
```

### Online Users
```
GET    /api/online-users?restaurant_id=   Get currently online users for a restaurant
```

---

## 🔌 Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `user_online` | `{ user_id, restaurant_id, name, role }` | Announce presence on connect |
| `join_kitchen` | `restaurant_id` | Kitchen screen joins restaurant room |
| `join_waiter` | `{ restaurant_id, waiterId }` | Waiter joins personal room |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `new_order` | Full order object with items | New dine-in order created |
| `new_delivery_order` | `{ id, customer_name, delivery_address, total }` | New delivery order |
| `order_status_changed` | `{ id, status }` | Order status updated |
| `order_updated` | `{ id }` | Order modified (items added/removed) |
| `delivery_status_changed` | `{ id, status }` | Delivery status updated |
| `delivery_updated` | `{ id, driver_id }` | Driver assigned to delivery |
| `bill_requested` | `{ order_id, table_id }` | Waiter requested bill |
| `online_users_updated` | Array of online users | Someone connected or disconnected |

---

## 💡 Key Business Logic

| Feature | Logic |
|---------|-------|
| Delivery Fee | $3 flat if food total < $60 · Free if food total ≥ $60 |
| Driver Capacity | Max 4 active deliveries per driver · System blocks assignment if limit reached |
| Driver Status | Auto set to "On Road" when assigned · Auto returns to "Available" when all deliveries resolved |
| Discount Warning | >40% triggers confirmation modal · 100% triggers extra warning modal |
| Discount Saved | Discount % and amount saved to DB · `final_total` updated · Reflected in reports |
| Item Cancellation | Can only cancel items still in `pending` status · Blocked if kitchen already started |
| Password Policy | New password must differ from current · Minimum 6 characters |
| Email Domain | Staff emails auto-generated as `name@owner_domain.com` · Enforced in UI |
| Pricing Tiers | 1–5 employees: $499 · 6–15: $999 · 16–30: $1,499 · 30+: $2,499 |
| AI Suggestions | Only sees own restaurant's menu · Free delivery nudge at $50–$59 order total |
| Stock Scoping | Every query includes `restaurant_id` — impossible cross-restaurant data access |

---

## 🧪 Testing

All APIs were tested with Postman before frontend development.

For multi-user testing in the browser:
- Normal browser window → Owner
- Incognito window 1 → Waiter
- Incognito window 2 → Kitchen
- Incognito window 3 → Delivery Operator

Each incognito window has its own isolated `localStorage`, ensuring separate JWT tokens.

---

## 🔒 Security Checklist

- [x] JWT on every protected route
- [x] `restaurant_id` scoped on every DB query
- [x] bcrypt password hashing (10 rounds)
- [x] Rate limiting (login + API + applications)
- [x] Global error handler (no stack traces in production)
- [x] Input validation (express-validator on critical routes)
- [x] `.env` excluded from Git
- [x] SQL injection prevention (parameterized queries)
- [x] CORS restricted to frontend origin
- [x] Inactive restaurant blocked at login
- [x] Helmet.js security headers
- [x] 2-step confirmation for destructive actions

---

## 🗺️ Roadmap

- [ ] Cloudinary integration for menu item photos
- [ ] Push notifications (PWA)
- [ ] Monthly revenue comparison charts
- [ ] Inventory management module
- [ ] Customer loyalty system
- [ ] Multi-branch support (single owner, multiple locations)
- [ ] PDF receipt generation
- [ ] Export reports to Excel

---

## 👨‍💻 About the Developer

Built by **Abdallah Khatib** — a Computer Science graduate from Lebanese International University with 5+ years of real pharmacy experience. Tawla is my second major full-stack system, following [PharmaCare](https://github.com/Abdallah-khatib-7/pharmacy-system) — a professional pharmacy management system.

- 💼 [LinkedIn](https://linkedin.com/in/abdallah-khatib)
- 🐙 [GitHub](https://github.com/Abdallah-khatib-7)
- 📧 abdallah.khatib2003@gmail.com

---

## 📄 License

This project is for portfolio and demonstration purposes. All rights reserved © 2026 Abdallah Khatib.