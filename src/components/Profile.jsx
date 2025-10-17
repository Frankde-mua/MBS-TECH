import React from "react";

const renderProfile = () => (
    <div>
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-slate-600">Manage your profile information.</p>
      </header>

      {/* Profile Form */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">User</h1>
        <div className="bg-white p-4 rounded shadow space-y-2">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input type="text" placeholder="Name" className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="text-sm font-medium">Company</label>
            <input type="text" placeholder="Company" className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" placeholder="Email" className="w-full border p-2 rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  export default renderProfile;