# LogiEdge Billing Dashboard

A full-stack billing dashboard built with React JS, Node.js / Express, and PostgreSQL.

---

## Project Structure

```
logiEdge/
├── frontend/          # React JS frontend
└── backend/           # Node.js + Express backend
    └── db/
        └── schema.sql # Database schema + seed data
```

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React JS 18, Custom CSS           |
| Backend   | Node.js, Express JS               |
| Database  | PostgreSQL                        |

---

## Prerequisites

- Node.js >= 16
- PostgreSQL >= 14
- npm

---

## 1. Database Setup

1. Open your PostgreSQL client (psql / pgAdmin).
2. Create a new database:
   ```sql
   CREATE DATABASE logiEdge_db;
   ```
3. Run the schema script:
   ```bash
   psql -U postgres -d logiEdge_db -f backend/db/schema.sql
   ```
   This will create all tables and insert the seed master data.

---

## 2. Backend Setup

```bash
cd backend
cp .env.example .env        # Edit with your DB credentials
npm install
npm start                   # Runs on http://localhost:5000
```

### Environment Variables (`backend/.env`)

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=logiEdge_db
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### API Endpoints

| Method | Endpoint                         | Description                      |
|--------|----------------------------------|----------------------------------|
| GET    | /api/customers                   | List all customers               |
| POST   | /api/customers                   | Create new customer              |
| GET    | /api/customers/:id               | Get single customer              |
| GET    | /api/customers/:id/invoices      | Get invoices for a customer      |
| GET    | /api/items                       | List all items                   |
| POST   | /api/items                       | Create new item                  |
| GET    | /api/invoices                    | List recent invoices             |
| GET    | /api/invoices/:id                | Get invoice with line items      |
| POST   | /api/invoices                    | Generate new invoice             |

---

## 3. Frontend Setup

```bash
cd frontend
npm install
npm start           # Runs on http://localhost:3000
```

> Make sure backend is running on port 5000 (or set REACT_APP_API_URL in a `.env` file).

---

## Features

### Master Module
- **Customer Master** – View all customers (Active/Inactive), Add new customers with Name, Address, PAN, GST, Status.
- **Items Master** – View all items with prices, Add new items with Name, Price, Status.

### Billing Module
- Step 1: Select an active customer.
- Step 2: Add items and set quantities (inline qty editor).
- GST logic: If customer has a GST number → 0% GST. If not → 18% GST applied automatically.
- Auto-generated Invoice ID: `INVC` + 6 unique digits (e.g. `INVC224830`), length = 10.
- View generated invoice with print support.

### Dashboard Module
- Summary stats: total invoices, total revenue, active customers.
- Search any invoice by Invoice ID.
- Filter invoices by customer.
- View full invoice details with printable layout.

---

## GST Logic

| Customer Type     | GST Applied |
|-------------------|-------------|
| GST Registered    | 0%          |
| Not GST Registered| 18%         |

---

## Invoice ID Format

- Starts with `INVC`
- Followed by 6 random digits
- Total length: **10 characters**
- Example: `INVC224830`, `INVC987341`
- Guaranteed unique (collision-checked in DB before insert)
