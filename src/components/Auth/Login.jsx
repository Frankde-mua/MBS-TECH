import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({
  name: "Frank Dev",
  company: "MBS Tech",
  email: "frank@mbstech.co.za",
});

  // ✅ Default allowed user
  const defaultUser = {
    name: "Frank Dev",
    company: "MBS Tech",
    email: "frank@mbstech.co.za",
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Check credentials
    if (
      form.name === defaultUser.name &&
      form.company === defaultUser.company &&
      form.email === defaultUser.email
    ) {
      localStorage.setItem("user", JSON.stringify(defaultUser));
      onLogin(defaultUser);
    } else {
      alert("Invalid login details. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-indigo-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-[350px]"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
        <p className="text-sm text-center text-slate-500 mb-6">
          Enter your details to access your dashboard
        </p>

        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full mb-3 border rounded p-2"
        />
        <input
          type="text"
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className="w-full mb-3 border rounded p-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full mb-4 border rounded p-2"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Login
        </button>

        {/* Optional hint */}
        <p className="text-xs text-center mt-4 text-slate-500">
          Default login: Dev / MBS Tech / frank@mbstech.co.za
        </p>
      </form>
    </div>
  );
};

export default Login;
