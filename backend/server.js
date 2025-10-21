import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import { usersToSeed } from "./data.js"

const { Pool } = pkg;

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// ---------------------
// ✅ System pool (to create new databases)
// ---------------------
const systemPool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DEFAULT_DB || "postgres", // default postgres DB
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// ---------------------
// ✅ NexSys main database connection
// ---------------------
const nexsysPool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: "nexsys",
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// ---------------------
// ✅ Helper to create DB if not exists
// ---------------------
const createDatabaseIfNotExists = async (dbName) => {
  try {
    await systemPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Created database ${dbName}`);
  } catch (err) {
    if (err.code === "42P04") {
      console.log(`⚠️ Database ${dbName} already exists, skipping creation`);
    } else {
      throw err;
    }
  }
};

// ---------------------
// ✅ Seed default users with roles
// ---------------------
const seedDefaultUsers = async () => {
  try {
    await nexsysPool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await nexsysPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50),
        password VARCHAR(255),
        email VARCHAR(255),
        cel VARCHAR(255),
        tel VARCHAR(255),
        vat_no BIGINT,
        company_name VARCHAR(100) REFERENCES companies(company_name),
        address VARCHAR(255),
        city VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        licence_no VARCHAR(100),
        business_type VARCHAR(50),
        onHold BOOLEAN DEFAULT FALSE,
        role VARCHAR(20) DEFAULT 'user'
      )
    `);

    //const usersToSeed = generatedUsers;

    for (const u of usersToSeed) {
      const companyDbName = `company_${u.company.toLowerCase().replace(/\s+/g, "_")}`;
      if (u.role !== "superadmin") {
        await createDatabaseIfNotExists(companyDbName);
      }

      await nexsysPool.query(
        `INSERT INTO companies (company_name) VALUES ($1) ON CONFLICT (company_name) DO NOTHING`,
        [u.company]
      );

      const userExists = await nexsysPool.query(
        `SELECT * FROM users WHERE username=$1 AND company_name=$2`,
        [u.username, u.company]
      );

      if (userExists.rowCount === 0) {
        await nexsysPool.query(
          `INSERT INTO users (username, password, email, company_name, role) VALUES ($1,$2,$3,$4,$5)`,
          [u.username, u.password, u.email, u.company, u.role]
        );
        console.log(`✅ Seeded user ${u.username} / ${u.company} as ${u.role}`);
      } else {
        console.log(`⚠️ User ${u.username} / ${u.company} already exists, skipping`);
      }
    }
  } catch (err) {
    console.error("❌ Error seeding default users:", err);
  }
};

// ---------------------
// ✅ API Routes
// ---------------------

// Login API
app.post("/api/login", async (req, res) => {
  const { username, company, password } = req.body;

  try {
    const { rows } = await nexsysPool.query(
      `SELECT * FROM users WHERE username=$1 AND company_name=$2 AND password=$3`,
      [username, company, password]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    console.log(`✅ User ${username} from company ${company} logged in successfully`);
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create company (Superadmin only)
app.post("/api/create-company", async (req, res) => {
  const { username, company, password, email } = req.body;

  const userRes = await nexsysPool.query(`SELECT role FROM users WHERE username=$1`, [username]);
  const userRole = userRes.rows[0]?.role;

  if (userRole !== "superadmin") {
    return res.status(403).json({ success: false, message: "Forbidden: Only Superadmin can create companies" });
  }

  const dbName = `company_${company.toLowerCase().replace(/\s+/g, "_")}`;

  try {
    await createDatabaseIfNotExists(dbName);

    await nexsysPool.query(
      `INSERT INTO companies (company_name) VALUES ($1) ON CONFLICT (company_name) DO NOTHING`,
      [company]
    );

    const userExists = await nexsysPool.query(
      `SELECT * FROM users WHERE username=$1 AND company_name=$2`,
      [username, company]
    );

    if (userExists.rowCount === 0) {
      await nexsysPool.query(
        `INSERT INTO users (username, password, email, company_name, role) VALUES ($1,$2,$3,$4,'admin')`,
        [username, password, email, company]
      );
    }

    res.send(`✅ Company '${company}' and user '${username}' created successfully!`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating company or user");
  }
});

// Create user (Admin only)
app.post("/api/create-user", async (req, res) => {
  const { username, email, password, company, creatorUsername } = req.body;

  try {
    const creatorRes = await nexsysPool.query(
      `SELECT role, company_name FROM users WHERE username=$1`,
      [creatorUsername]
    );
    const creator = creatorRes.rows[0];

    if (!creator) return res.status(404).json({ success: false, message: "Creator not found" });

    if (creator.role !== "admin" && creator.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Forbidden: Only admins can create users" });
    }

    if (creator.role === "admin" && creator.company_name !== company) {
      return res.status(403).json({ success: false, message: "Forbidden: Cannot create user outside your company" });
    }

    const userExists = await nexsysPool.query(
      `SELECT * FROM users WHERE username=$1 AND company_name=$2`,
      [username, company]
    );

    if (userExists.rowCount > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    await nexsysPool.query(
      `INSERT INTO users (username, password, email, company_name, role) VALUES ($1,$2,$3,$4,'user')`,
      [username, password, email, company]
    );

    res.json({ success: true, message: `User ${username} created successfully for company ${company}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Superadmin overview
app.get("/api/superadmin/overview", async (req, res) => {
  try {
    const companiesRes = await nexsysPool.query(`SELECT * FROM companies`);
    const usersRes = await nexsysPool.query(`SELECT * FROM users`);

    res.json({
      success: true,
      companies: companiesRes.rows,
      users: usersRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all users (Superadmin)
app.get("/api/superadmin/users", async (req, res) => {
  try {
    const { rows } = await nexsysPool.query("SELECT id, username, email, company_name, role FROM users");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// Get all companies (Superadmin)
app.get("/api/superadmin/companies", async (req, res) => {
  try {
    const { rows } = await nexsysPool.query("SELECT id, company_name FROM companies");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});


// ---------------------
// ✅ Expenditure / Expense Category API
// ---------------------
// Helper: get company pool
const getCompanyPool = (companyName) => {
  const dbName = `company_${companyName.toLowerCase().replace(/\s+/g, "_")}`;
  return new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: dbName,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
};

// Get all expense categories for a company
app.get("/api/expense-categories/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);

  try {
    const { rows } = await companyPool.query("SELECT id, category_name FROM expense_category ORDER BY category_name ASC");
    res.json({ success: true, categories: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching expense categories" });
  }
});

// Get all calender status for a company
app.get("/api/status/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);

  try {
    const { rows } = await companyPool.query("SELECT id, status_desc FROM calendar_status ORDER BY status_desc ASC");
    res.json({ success: true, statuses: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching expense categories" });
  }
});


// Get all calender status for a company
app.get("/api/status/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);

  try {
    const { rows } = await companyPool.query("SELECT id, status_desc FROM calendar_status ORDER BY status_desc ASC");
    res.json({ success: true, statuses: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching calendar status" });
  }
});

// Create new status
app.post("/api/status/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);
  const { status_desc } = req.body;

  try {
    const insertQuery = `
      INSERT INTO calendar_status (status_desc)
      VALUES ($1)
      RETURNING *;
    `;
    const values = [status_desc];
    const { rows } = await companyPool.query(insertQuery, values);

    res.json({ success: true, status: rows[0] });
  } catch (err) {
    console.error("Error inserting new status:", err);
    res.status(500).json({ success: false, message: "Error adding status" });
  }
});

// Get all calender agendas for a company
app.get("/api/calendar/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);

  try {
    const { rows } = await companyPool.query("SELECT c.id, c.agenda, cs.status_desc, c.time FROM calendar c LEFT JOIN calendar_status cs ON c.status_id = cs.id ORDER BY c.id");
    res.json({ success: true, statuses: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching calendar status" });
  }
});

// Post a new agenda
app.post("/api/calendar/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);
  const { agenda, status_id, time } = req.body;

  try {
    const insertQuery = `
      INSERT INTO calendar (agenda, status_id, time)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [agenda, status_id || null, time || "00:00"];

    const { rows } = await companyPool.query(insertQuery, values);

    res.json({ success: true, agenda: rows[0] });
  } catch (err) {
    console.error("Error inserting new agenda:", err);
    res.status(500).json({ success: false, message: "Error adding agenda" });
  }
});


// Post a new expenditure
app.post("/api/expenditures/:company", async (req, res) => {
  const { company } = req.params;
  const {
    date,
    supplier,
    category_id,
    category_name,
    description,
    amount,
    vat_amount,
    payment_method,
    receipt_no,
    scan,
    notes,
  } = req.body;

  if (!category_id || !description || !amount) {
    return res.status(400).json({
      success: false,
      message: "Category, description, and amount are required",
    });
  }

  const companyPool = getCompanyPool(company);

  try {
    const insertQuery = `
      INSERT INTO expenditure (
        date,
        supplier,
        category_name,
        description,
        amount,
        payment_method,
        receipt_no,
        scan,
        notes,
        created_at,
        category_id,
        vat_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, $11)
      RETURNING *
    `;

    const values = [
      date,
      supplier || null,
      category_name,
      description,
      parseFloat(amount),
      payment_method || null,
      receipt_no || null,
      scan || null,
      notes || null,
      category_id,
      vat_amount ? parseFloat(vat_amount) : 0,
    ];

    const { rows } = await companyPool.query(insertQuery, values);
    res.json({ success: true, expenditure: rows[0] });
  } catch (err) {
    console.error("❌ Error inserting expenditure:", err);
    res.status(500).json({ success: false, message: "Error creating expenditure" });
  }
});


// ---------------------
// ✅ Start Server
// ---------------------
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await createDatabaseIfNotExists("nexsys");
  await seedDefaultUsers();
});
