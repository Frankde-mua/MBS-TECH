const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors()); // allow frontend to access

const DATA_FILE = "./data.json";

// Read data from JSON
function readData() {
  const raw = fs.readFileSync(DATA_FILE);
  return JSON.parse(raw);
}

// Write data to JSON
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all customers
app.get("/customers", (req, res) => {
  res.json(readData());
});

// Add new customer
app.post("/customers", (req, res) => {
  const customers = readData();
  const newCustomer = { id: Date.now(), ...req.body };
  customers.push(newCustomer);
  writeData(customers);
  res.json(newCustomer);
});

// Update customer
app.put("/customers/:id", (req, res) => {
  const customers = readData();
  const id = Number(req.params.id);
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).send("Customer not found");

  customers[index] = { ...customers[index], ...req.body };
  writeData(customers);
  res.json(customers[index]);
});

// Delete customer
app.delete("/customers/:id", (req, res) => {
  let customers = readData();
  const id = Number(req.params.id);
  customers = customers.filter(c => c.id !== id);
  writeData(customers);
  res.sendStatus(204);
});

app.listen(3001, () => console.log("Server running on port 3001"));
