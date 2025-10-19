import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

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
// ✅ Seed default users
// ---------------------
const seedDefaultUsers = async () => {
  try {
    // Ensure main tables exist
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
        onHold BOOLEAN DEFAULT FALSE
      )
    `);

    const usersToSeed = [
      {
        username: "Frank Dev",
        email: "frank@mbstech.co.za",
        company: "MBS Tech",
        password: "password123",
      },
      {
        username: "Jane Doe",
        email: "jane@devsolutions.com",
        company: "DevSolutions",
        password: "password123",
      },
    ];

    for (const u of usersToSeed) {
      const companyDbName = `company_${u.company.toLowerCase().replace(/\s+/g, "_")}`;
      await createDatabaseIfNotExists(companyDbName);

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
          `INSERT INTO users (username, password, email, company_name) VALUES ($1,$2,$3,$4)`,
          [u.username, u.password, u.email, u.company]
        );
        console.log(`✅ Seeded user ${u.username} / ${u.company}`);
      } else {
        console.log(`⚠️ User ${u.username} / ${u.company} already exists, skipping seeding`);
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

// Create new company
app.post("/api/create-company", async (req, res) => {
  const { username, password, email, company } = req.body;
  const dbName = `company_${company.toLowerCase().replace(/\s+/g, "_")}`;

  try {
    await createDatabaseIfNotExists(dbName);

    // Ensure main NexSys tables exist
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
        onHold BOOLEAN DEFAULT FALSE
      )
    `);

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
        `INSERT INTO users (username, password, email, company_name) VALUES ($1,$2,$3,$4)`,
        [username, password, email, company]
      );
    }

    res.send(`✅ Company '${company}' and user '${username}' created successfully!`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating company or user");
  }
});

// Query per-company DB example
app.get("/api/company/:company/clients", async (req, res) => {
  const { company } = req.params;
  const dbName = `company_${company.toLowerCase().replace(/\s+/g, "_")}`;

  try {
    const companyPool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: dbName,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT,
    });

    const { rows } = await companyPool.query("SELECT * FROM clients LIMIT 5");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching company data");
  }
});

// ---------------------
// ✅ Start Server
// ---------------------
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await createDatabaseIfNotExists("nexsys"); // ensure main DB exists
  await seedDefaultUsers(); // seed default users
});
