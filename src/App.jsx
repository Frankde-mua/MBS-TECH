import React, { useState, useEffect } from "react";
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
import NexSysLogo from "./assets/nexsys-logo.png";
import { Menu, X } from "lucide-react";
import { SAMPLE_EVENTS, METRICS, CHART_DATA } from "./data/dashboard_data";
import Login from "./components/Auth/Login";
import Loader from "./components/Utlies/Loader";
import Billing from "./components/Billing";
import Calendar from "./components/Calendar";
import ClientGrid from "./components/Customers";
import renderInventory from "./components/Inventory";
import Profile from "./components/Profile";
import Expenditure from "./components/Expenditure";

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

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [selectedDate, setSelectedDate] = useState(formatISO(new Date()));
  const [current, setCurrent] = useState(() => new Date());
  const [loading, setLoading] = useState(false);
  const [loaderLabel, setLoaderLabel] = useState("NexSys");
  const [mobileOpen, setMobileOpen] = useState(false);


  // Restore login from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);

      // ⏰ Setup auto-logout timer (60 minutes)
      const logoutTimer = setTimeout(() => {
        localStorage.removeItem("user");
        setUser(null);
        alert("Session expired. You’ve been logged out automatically.");
      }, 60 * 60 * 1000); // 60 minutes

      // 🧹 Clear timer if user logs out manually or component unmounts
      return () => clearTimeout(logoutTimer);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    setLoaderLabel("Nex out..."); // change label for logout
    setLoading(true);

    setTimeout(() => {
      localStorage.removeItem("user");
      setUser(null);
      setCurrentPage("dashboard");
      setLoaderLabel("NexSys"); // reset label back for next login
      setLoading(false);
    }, 2500); // adjust duration as needed
  };


  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const renderDashboard = () => (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-600">Overview of key metrics.</p>
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

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-indigo-100">
      {/* ✅ Navbar */}
            {/* ✅ Navbar */}
      <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-30 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between w-full">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center h-24 ml-2">
              <img
                src={NexSysLogo}
                alt="NexSys"
                className="h-24 w-auto object-contain -mt-2"
                style={{ marginLeft: "-2.5rem" }}
              />
            </div>
          </div>

          {/* Desktop Menu */}
          <ul
            className="hidden md:flex gap-4 text-sm text-slate-600"
            style={{ marginLeft: "-2.5rem" }}
          >
            {[
              ["dashboard", "Dashboard"],
              ["calendar", "Calendar"],
              ["billing", "Billing"],
              ["inventory", "Inventory"],
              ["expense", "Expense"],
              ["customer", "Customer"],
              ["profile", "Profile"],
            ].map(([page, label]) => (
              <li
                key={page}
                onClick={() => {
                  setLoading(true);
                  setCurrentPage(page);
                  setTimeout(() => setLoading(false), 3000);
                }}
                className={`cursor-pointer ${
                  currentPage === page ? "text-indigo-600 font-medium" : ""
                }`}
              >
                {label}
              </li>
            ))}
          </ul>

          {/* Right: User & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-slate-600">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-500 border border-red-400 px-2 py-1 rounded hover:bg-red-50"
            >
              Logout
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-t shadow-sm md:hidden">
            <ul className="flex flex-col text-sm text-slate-700">
              {[
                ["dashboard", "Dashboard"],
                ["calendar", "Calendar"],
                ["billing", "Billing"],
                ["inventory", "Inventory"],
                ["expense", "Expense"],
                ["customer", "Customer"],
                ["profile", "Profile"],
              ].map(([page, label]) => (
                <li
                  key={page}
                  onClick={() => {
                    setMobileOpen(false);
                    setLoading(true);
                    setCurrentPage(page);
                    setTimeout(() => setLoading(false), 3000);
                  }}
                  className={`px-4 py-2 border-b cursor-pointer hover:bg-indigo-50 ${
                    currentPage === page ? "text-indigo-600 font-medium" : ""
                  }`}
                >
                  {label}
                </li>
              ))}

              <li className="px-4 py-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-500 border border-red-400 px-2 py-1 rounded hover:bg-red-50 text-xs"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* ✅ Loader Overlay */}
      <Loader show={loading} label={loaderLabel} />

      {/* ✅ Main Content */}
      <main className="flex-1 overflow-y-auto bg-indigo-100 mt-16 px-4 pb-6">
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
          {currentPage === "inventory" && renderInventory({ setLoading })}
          {currentPage === "expense" && <Expenditure />}
          {currentPage === "customer" && <ClientGrid setCurrentPage={setCurrentPage} />}
          {currentPage === "profile" && <Profile user={user} />}
        </div>
      </main>

      {/* ✅ Footer */}
      <footer className="bg-gray-100 border-t py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <p>© {new Date().getFullYear()} NexSys. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
            <a href="#" className="hover:text-indigo-600">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
