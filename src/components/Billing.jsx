import React, { useState } from "react";

const BILLING_SERVICES = [
  { id: 1, name: "Website Hosting", price: 150 },
  { id: 2, name: "SEO Optimization", price: 300 },
  { id: 3, name: "Email Marketing", price: 200 },
  { id: 4, name: "Social Media Management", price: 400 }
];

const Billing = () => {
  // Internal state
  const [selectedServices, setSelectedServices] = useState([]);
  const [manualService, setManualService] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualList, setManualList] = useState([]);
  const [showInvoice, setShowInvoice] = useState(false);

  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const totalBilling =
    selectedServices.reduce((sum, id) => {
      const svc = BILLING_SERVICES.find((s) => s.id === id);
      return sum + (svc ? svc.price : 0);
    }, 0) +
    manualList.reduce((sum, m) => sum + Number(m.price || 0), 0);

  const handleAddManual = () => {
    if (!manualService || !manualPrice) return;
    setManualList([...manualList, { name: manualService, price: Number(manualPrice) }]);
    setManualService("");
    setManualPrice("");
  };

  const userData = JSON.parse(localStorage.getItem("userProfile") || "{}");

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <button
          onClick={() => setShowInvoice(true)}
          className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
        >
          Generate Invoice
        </button>
      </header>

        {/* Quick Services */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
          <h2 className="text-sm font-semibold mb-4">Quick Service Selection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BILLING_SERVICES.map((s) => (
              <div
                key={s.id}
                onClick={() => toggleService(s.id)}
                className={`p-3 rounded-lg border cursor-pointer ${
                  selectedServices.includes(s.id)
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="font-medium text-sm">{s.name}</div>
                <div className="text-xs text-slate-500">R{s.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Add */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
          <h2 className="text-sm font-semibold mb-4">Manual Service Entry</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Service Name"
              value={manualService}
              onChange={(e) => setManualService(e.target.value)}
              className="border rounded-lg p-2 flex-1 text-sm"
            />
            <input
              type="number"
              placeholder="Price (R)"
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value)}
              className="border rounded-lg p-2 w-32 text-sm"
            />
            <button
              onClick={handleAddManual}
              className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Billing Summary</h2>
          {selectedServices.length === 0 && manualList.length === 0 ? (
            <p className="text-sm text-slate-500">No services selected.</p>
          ) : (
            <table className="w-full text-sm border-t">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Service</th>
                  <th className="py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedServices.map((id) => {
                  const s = BILLING_SERVICES.find((x) => x.id === id);
                  return (
                    <tr key={s.id} className="border-b">
                      <td className="py-2">{s.name}</td>
                      <td className="py-2">R{s.price}</td>
                    </tr>
                  );
                })}
                {manualList.map((m, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{m.name}</td>
                    <td className="py-2">R{m.price}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 font-medium">Total</td>
                  <td className="py-2 font-semibold">R{totalBilling}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Invoice Modal */}
        {showInvoice && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative animate-fadeIn">
              <button
                onClick={() => setShowInvoice(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
              <div className="text-center mb-4">
                {userData.logo && (
                  <img
                    src={userData.logo}
                    alt="Logo"
                    className="w-16 h-16 mx-auto rounded-full mb-2"
                  />
                )}
                <h2 className="text-xl font-semibold">
                  {userData.company || "Your Company"}
                </h2>
                <p className="text-sm text-slate-500">
                  {userData.name || "Client"} — {userData.email || "email@example.com"}
                </p>
              </div>
              <div>
                <table className="w-full text-sm border-t">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">Service</th>
                      <th className="py-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedServices.map((id) => {
                      const s = BILLING_SERVICES.find((x) => x.id === id);
                      return (
                        <tr key={s.id} className="border-b">
                          <td className="py-2">{s.name}</td>
                          <td className="py-2">R{s.price}</td>
                        </tr>
                      );
                    })}
                    {manualList.map((m, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{m.name}</td>
                        <td className="py-2">R{m.price}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-2 font-medium">Total</td>
                      <td className="py-2 font-semibold">R{totalBilling}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => window.print()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowInvoice(false)}
                  className="text-slate-600 text-sm hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default Billing;