// import dashboardData from "./data/dashboard_data";
// const { SAMPLE_EVENTS, METRICS, CHART_DATA } = dashboardData;
import React, { useState, useRef, useMemo } from "react";
import "./app.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { SAMPLE_EVENTS, METRICS, CHART_DATA } from "./data/dashboard_data";
import renderInventory from "./components/Inventory";
import renderProfile from "./components/Profile";
import Billing from "./components/Billing";
import Calendar from "./components/Calendar";
import ClientGrid from "./components/Customers";

// --- Utility functions ---
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function formatISO(date) {
  return date.toISOString().slice(0, 10);
}

// --- Main App ---
export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [current, setCurrent] = useState(() => new Date());
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [selectedDate, setSelectedDate] = useState(formatISO(new Date()));

  // Just an example filter (not required for Calendar, but used elsewhere)
  const agendaForSelected = events.filter((e) => e.date === selectedDate);

  // --- Dashboard section ---
  const renderDashboard = () => (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-600">Overview of key metrics</p>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {METRICS.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-2xl shadow-sm"
          >
            <div className="text-sm text-slate-500">{m.label}</div>
            <div className="text-2xl font-medium mt-2">{m.value}</div>
          </motion.div>
        ))}
      </div>
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Visitors (last 7 days)</h2>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CHART_DATA}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-lg text-indigo-600">MBS Tech</span>
            <ul className="hidden md:flex gap-4 text-sm text-slate-600">
              <li
                onClick={() => setCurrentPage("dashboard")}
                className={`cursor-pointer ${
                  currentPage === "dashboard"
                    ? "text-indigo-600 font-medium"
                    : ""
                }`}
              >
                Reports
              </li>
              <li
                onClick={() => setCurrentPage("calendar")}
                className={`cursor-pointer ${
                  currentPage === "calendar"
                    ? "text-indigo-600 font-medium"
                    : ""
                }`}
              >
                Calendar
              </li>
              <li
                onClick={() => setCurrentPage("billing")}
                className={`cursor-pointer ${
                  currentPage === "billing"
                    ? "text-indigo-600 font-medium"
                    : ""
                }`}
              >
                Billing
              </li>
              <li
                onClick={() => setCurrentPage("inventory")}
                className={`cursor-pointer ${
                  currentPage === "inventory"
                    ? "text-indigo-600 font-medium"
                    : ""
                }`}
              >
                Inventory
              </li>
              <li
                onClick={() => setCurrentPage("customer")}
                className={`cursor-pointer ${
                  currentPage === "customer"
                    ? "text-indigo-600 font-medium"
                    : ""
                }`}
              >
                Customer
              </li>
              <li
                onClick={() => setCurrentPage("profile")}
                className={`cursor-pointer ${
                  currentPage === "profile"
                    ? "text-indigo-600 font-medium"
                    : ""
                }`}
              >
                Profile
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search..."
              className="hidden md:block text-sm px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
              F
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="p-4 max-w-7xl mx-auto">
        {currentPage === "dashboard" && renderDashboard()}
        {currentPage === "calendar" && (
          <Calendar
            current={current}
            setCurrent={setCurrent}
            events={events}
            setEvents={setEvents}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            startOfMonth={startOfMonth}
            endOfMonth={endOfMonth}
            addDays={addDays}
            formatISO={formatISO}
          />
        )}
        {currentPage === "billing" && <Billing />}
        {currentPage === "inventory" && renderInventory()}
        {currentPage === "customer" && <ClientGrid />}
        {currentPage === "profile" && renderProfile()}
      </div>
    </div>
  );
}
