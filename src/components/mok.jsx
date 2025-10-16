import React, { useState } from "react";
import "./app.css";
import { Menu, X } from "lucide-react";
import { SAMPLE_EVENTS, METRICS, CHART_DATA } from "./data/dashboard_data";

// Components
import renderInventory from "./components/Inventory";
import renderProfile from "./components/Profile";
import Billing from "./components/Billing";
import Calendar from "./components/Calendar";
import ClientGrid from "./components/Customers";

// --- Helper functions ---
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

// --- Dashboard Component ---
function renderDashboard() {
  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-600">Overview of key metrics</p>
        </div>
      </header>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {METRICS.map((m) => (
          <div
            key={m.id}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition"
          >
            <div className="text-sm text-slate-500">{m.label}</div>
            <div className="text-2xl font-medium mt-2">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Visitors (last 7 days)</h2>
        </div>
        <div style={{ height: 220 }}>
          <p className="text-slate-500 italic text-sm">
            Chart placeholder — coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  // Calendar state
  const [current, setCurrent] = useState(() => new Date());
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [selectedDate, setSelectedDate] = useState(formatISO(new Date()));

  const navItems = [
    ["dashboard", "Reports"],
    ["calendar", "Calendar"],
    ["billing", "Billing"],
    ["inventory", "Inventory"],
    ["customer", "Customer"],
    ["profile", "Profile"],
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-indigo-100">
      {/* ✅ Fixed Navbar */}
      <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-30 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between w-full">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-lg text-indigo-600">MBS Tech</span>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex gap-4 text-sm text-slate-600">
            {navItems.map(([page, label]) => (
              <li
                key={page}
                onClick={() => {
                  setCurrentPage(page);
                  setMenuOpen(false);
                }}
                className={`cursor-pointer transition-colors ${
                  currentPage === page
                    ? "text-indigo-600 font-medium"
                    : "hover:text-indigo-500"
                }`}
              >
                {label}
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search..."
              className="hidden md:block text-sm px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
              F
            </div>

            {/* Hamburger icon (mobile only) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-indigo-600"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ✅ Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-t shadow-md md:hidden z-20">
            <ul className="flex flex-col p-4 space-y-2 text-slate-700">
              {navItems.map(([page, label]) => (
                <li
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    setMenuOpen(false);
                  }}
                  className={`cursor-pointer px-2 py-1 rounded-lg ${
                    currentPage === page
                      ? "bg-indigo-100 text-indigo-600 font-medium"
                      : "hover:bg-indigo-50"
                  }`}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* ✅ Scrollable content below fixed navbar */}
      <main
        className="
          flex-1
          overflow-y-auto
          mt-16
          px-4
          pb-6
          bg-indigo-100
          [scrollbar-gutter:stable]
        "
      >
        <div className="max-w-7xl mx-auto w-full">
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
          {currentPage === "customer" && (
            <ClientGrid setCurrentPage={setCurrentPage} />
          )}
          {currentPage === "profile" && renderProfile()}
        </div>
      </main>
    </div>
  );
}
