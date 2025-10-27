import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

const Email = () => {
  const [emails, setEmails] = useState([]);
  const [tab, setTab] = useState("inbox");
  const [form, setForm] = useState({ to: "", subject: "", message: "" });

  const loadEmails = async (type) => {
    const res = await fetch(`${API_URL}/emails/${type}`);
    const data = await res.json();
    setEmails(data);
  };

  useEffect(() => {
    if (window.location.search.includes("connected=true")) {
      loadEmails("inbox");
    }
  }, []);

  const sendEmail = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/emails/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    alert(data.message || "Sent!");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">📧 My Gmail Dashboard</h2>

      <button
        className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        onClick={() => {
          window.location.href = `${API_URL}/auth/google`;
        }}
      >
        Connect Gmail
      </button>

      {/* Tabs */}
      <div className="mt-6 flex gap-4">
        {["inbox", "sent", "drafts"].map((type) => (
          <button
            key={type}
            className={`px-4 py-2 rounded-md ${
              tab === type
                ? "bg-gray-300 font-semibold"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => {
              setTab(type);
              loadEmails(type);
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Emails */}
      <h3 className="mt-8 text-2xl font-semibold">{tab.toUpperCase()}</h3>
      <div className="mt-4 space-y-4">
        {emails.length === 0 && (
          <p className="text-gray-500">No emails to display.</p>
        )}
        {emails.map((m) => (
          <div
            key={m.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer bg-white"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-800">{m.from || "Unknown Sender"}</span>
              <span className="text-sm text-gray-500">{new Date(m.date).toLocaleString()}</span>
            </div>
            <div className="font-medium text-gray-900 mb-1">{m.subject || "No Subject"}</div>
            <p className="text-gray-700 text-sm">{m.snippet}</p>
          </div>
        ))}
      </div>

      {/* Send Email Form */}
      <h3 className="mt-10 text-2xl font-semibold">✉️ Send a New Email</h3>
      <form onSubmit={sendEmail} className="mt-4 space-y-4">
        <input
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="To"
          value={form.to}
          onChange={(e) => setForm({ ...form, to: e.target.value })}
        />
        <input
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
        <textarea
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={5}
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Email;
