import React, { useState } from "react";

const FinancialEnquiries = () => {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [transactions, setTransactions] = useState([
    {
      date: "2025-10-15",
      tariff: "CONS001",
      doctor: "Dr. Smith",
      patient: "John Doe",
      narrative: "Eye Examination",
      debit: 950.0,
      credit: 0.0,
      balance: 950.0,
    },
    {
      date: "2025-10-20",
      tariff: "PAY001",
      doctor: "",
      patient: "John Doe",
      narrative: "Payment received (EFT)",
      debit: 0.0,
      credit: 950.0,
      balance: 0.0,
    },
  ]);

  const [summary] = useState({
    debitsToDate: 950,
    creditsToDate: 950,
    current: 0,
    unallocated: 0,
    total: 0,
  });

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm w-full max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold text-slate-700 mb-4">
        💼 Financial Enquiries
      </h2>

      {/* Top Summary Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <div>
            <label className="text-sm text-gray-600">Customer</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Customer</option>
              <option value="John Doe">John Doe</option>
              <option value="Sarah Smith">Sarah Smith</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Account Address</label>
            <input
              type="text"
              value={selectedCustomer ? "219B Gloxinia Street" : ""}
              readOnly
              className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 w-full text-gray-700"
            />
          </div>
        </div>

        {/* Right-side summary box */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-700 mb-2">Account Summary</h4>
          <div className="grid grid-cols-2 text-sm gap-y-1">
            <span className="text-gray-600">Debits to Date:</span>
            <span className="text-gray-800 font-medium">
              R {summary.debitsToDate.toFixed(2)}
            </span>
            <span className="text-gray-600">Credits to Date:</span>
            <span className="text-gray-800 font-medium">
              R {summary.creditsToDate.toFixed(2)}
            </span>
            <span className="text-gray-600">Current Balance:</span>
            <span className="text-gray-800 font-medium">
              R {summary.total.toFixed(2)}
            </span>
            <span className="text-gray-600">Unallocated:</span>
            <span className="text-gray-800 font-medium">
              R {summary.unallocated.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-3 border-b">Date</th>
              <th className="py-2 px-3 border-b">service</th>
              <th className="py-2 px-3 border-b">user</th>
              <th className="py-2 px-3 border-b">Customer</th>
              <th className="py-2 px-3 border-b">Narrative</th>
              <th className="py-2 px-3 border-b text-right">Debit (R)</th>
              <th className="py-2 px-3 border-b text-right">Credit (R)</th>
              <th className="py-2 px-3 border-b text-right">Balance (R)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="text-center text-gray-500 py-4 italic"
                >
                  No transactions found for this customer.
                </td>
              </tr>
            ) : (
              transactions.map((t, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-2 px-3 border-b">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3 border-b">{t.service}</td>
                  <td className="py-2 px-3 border-b">{t.user}</td>
                  <td className="py-2 px-3 border-b">{t.customer}</td>
                  <td className="py-2 px-3 border-b">{t.narrative}</td>
                  <td className="py-2 px-3 border-b text-right">
                    {t.debit ? t.debit.toFixed(2) : ""}
                  </td>
                  <td className="py-2 px-3 border-b text-right">
                    {t.credit ? t.credit.toFixed(2) : ""}
                  </td>
                  <td className="py-2 px-3 border-b text-right">
                    {t.balance.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialEnquiries;
