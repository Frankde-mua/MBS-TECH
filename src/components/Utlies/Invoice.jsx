import React, { useState, useEffect } from "react";
import ClientList from "./ClientList";

const BILLING_SERVICES = [
  { id: 1, name: "Website Hosting", price: 150 },
  { id: 2, name: "SEO Optimization", price: 300 },
  { id: 3, name: "Email Marketing", price: 200 },
  { id: 4, name: "Social Media Management", price: 400 },
];

const Invoice = () => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [manualService, setManualService] = useState("");
  const [discountService, setDiscountService] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualList, setManualList] = useState([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // 🧠 Load selected client from localStorage when modal closes
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setShowClients(false);
    localStorage.setItem("selectedClient", JSON.stringify(client));
  };

  useEffect(() => {
    const client = JSON.parse(localStorage.getItem("selectedClient"));
    if (client) setSelectedClient(client);
  }, [showClients]);

  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // 💰 Calculate totals
  const totalBilling =
    selectedServices.reduce((sum, id) => {
      const svc = BILLING_SERVICES.find((s) => s.id === id);
      return sum + (svc ? svc.price : 0);
    }, 0) +
    manualList.reduce((sum, m) => {
      const discountAmount = (m.price * (Number(m.discount) || 0)) / 100;
      return sum + (m.price - discountAmount);
    }, 0);

  const totalVAT = totalBilling * 0.15;

  // ➕ Add manual service with discount
  const handleAddManual = () => {
    if (!manualService || !manualPrice) return;
    setManualList([
      ...manualList,
      {
        name: manualService,
        discount: discountService ? Number(discountService) : 0,
        price: Number(manualPrice),
      },
    ]);
    setDiscountService("");
    setManualService("");
    setManualPrice("");
  };

  const userData = JSON.parse(localStorage.getItem("userProfile") || "{}");

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg mt-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">🧾 Invoice</h1>

      <div className="space-y-6">
        {/* Quick Services */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
          <h2 className="text-sm font-semibold mb-4 text-slate-700">
            Quick Service Selection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BILLING_SERVICES.map((s) => (
              <div
                key={s.id}
                onClick={() => toggleService(s.id)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedServices.includes(s.id)
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="font-medium text-sm">{s.name}</div>
                <div className="text-xs text-slate-500">R{s.price}.00</div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Search */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
          <h2 className="text-sm font-semibold mb-4 text-slate-700">Client Details</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="First Name"
              value={selectedClient?.name || ""}
              className="border rounded-lg p-2 flex-1 text-sm bg-white"
              disabled
            />
            <input
              type="text"
              placeholder="Last Name"
              value={selectedClient?.surname || ""}
              className="border rounded-lg p-2 flex-1 text-sm bg-white"
              disabled
            />
            <input
              type="text"
              placeholder="Email"
              value={selectedClient?.email || ""}
              className="border rounded-lg p-2 flex-1 text-sm bg-white"
              disabled
            />
            <button
              onClick={() => setShowClients(true)}
              className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
            >
              {selectedClient ? "Change" : "Search"}
            </button>
          </div>

          {selectedClient && (
            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <p><strong>Cell:</strong> {selectedClient.cell}</p>
              <p><strong>Type:</strong> {selectedClient.type}</p>
              <p><strong>Address:</strong> {selectedClient.address}</p>
            </div>
          )}
        </div>

        {/* Manual Add */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
          <h2 className="text-sm font-semibold mb-4 text-slate-700">
            Manual Service Entry
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Service Name"
              value={manualService}
              onChange={(e) => setManualService(e.target.value)}
              className="border rounded-lg p-2 flex-1 text-sm bg-white"
            />
            <input
              type="number"
              placeholder="Discount in %"
              value={discountService}
              onChange={(e) => setDiscountService(e.target.value)}
              className="border rounded-lg p-2 w-32 text-sm bg-white"
            />
            <input
              type="number"
              placeholder="Price (R)"
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value)}
              className="border rounded-lg p-2 w-32 text-sm bg-white"
            />
            <button
              onClick={handleAddManual}
              className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
          <h2 className="text-sm font-semibold mb-4 text-slate-700">Billing Summary</h2>
          {selectedServices.length === 0 && manualList.length === 0 ? (
            <p className="text-sm text-slate-500">No services selected.</p>
          ) : (
            <table className="w-full text-sm border-t">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Service</th>
                  <th className="py-2">Discount</th>
                  <th className="py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedServices.map((id) => {
                  const s = BILLING_SERVICES.find((x) => x.id === id);
                  return (
                    <tr key={s.id} className="border-b">
                      <td className="py-2">{s.name}</td>
                      <td className="py-2 text-slate-500">—</td>
                      <td className="py-2">R{s.price}.00</td>
                    </tr>
                  );
                })}

                {manualList.map((m, idx) => {
                  const discount = Number(m.discount) || 0;
                  const discountAmount = (m.price * discount) / 100;
                  const discountedPrice = m.price - discountAmount;
                  return (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{m.name}</td>
                      <td className="py-2">{discount > 0 ? `${discount}%` : "—"}</td>
                      <td className="py-2">
                        {discount > 0 ? (
                          <>
                            <span className="text-green-600 font-medium">
                              R{discountedPrice.toFixed(2)}
                            </span>
                            <span className="ml-2 text-slate-400 line-through text-xs">
                              R{m.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <>R{m.price.toFixed(2)}</>
                        )}
                      </td>
                    </tr>
                  );
                })}

                <tr>
                  <td className="py-2 font-medium">VAT</td>
                  <td></td>
                  <td className="py-2 font-semibold">R{totalVAT.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Total</td>
                  <td></td>
                  <td className="py-2 font-semibold">R{totalBilling.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          )}
          <button
            onClick={() => setShowInvoice(true)}
            className="bg-indigo-600 text-white text-sm px-4 py-2 mt-4 rounded-lg shadow hover:bg-indigo-700"
          >
            Generate Invoice
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setShowInvoice(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <div className="text-center mb-4">
              {userData.logo ? (
                <img
                  src={userData.logo}
                  alt="Logo"
                  className="w-16 h-16 mx-auto rounded-full mb-2"
                />
              ) : (
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 mb-2" />
              )}
              <h2 className="text-xl font-semibold">
                {userData.company || "Your Company"}
              </h2>
              <p className="text-sm text-slate-500">
                {userData.email || "email@example.com"}
              </p>
              <p className="text-sm text-slate-500 font-medium">Tax Invoice</p>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p><strong>Name:</strong> {selectedClient?.name}</p>
              <p><strong>Surname:</strong> {selectedClient?.surname}</p>
              <p><strong>Cell:</strong> {selectedClient?.cell}</p>
              <p><strong>Type:</strong> {selectedClient?.type}</p>
              <p><strong>Address:</strong> {selectedClient?.address}</p>
            </div>

            <table className="w-full text-sm border-t mt-4">
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
                      <td className="py-2">R{s.price.toFixed(2)}</td>
                    </tr>
                  );
                })}
                {manualList.map((m, idx) => {
                  const discountAmount = (m.price * (Number(m.discount) || 0)) / 100;
                  const discountedPrice = m.price - discountAmount;
                  return (
                    <tr key={idx} className="border-b">
                      <td className="py-2">
                        {m.name} {m.discount ? `(${m.discount}% off)` : ""}
                      </td>
                      <td className="py-2">R{discountedPrice.toFixed(2)}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td className="py-2 font-medium">VAT</td>
                  <td className="py-2 font-semibold">R{totalVAT.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Total</td>
                  <td className="py-2 font-semibold">R{totalBilling.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => window.print()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {showClients && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center w-full max-w-4xl">
            <h2 className="text-xl font-bold mb-4">Client List</h2>
            <ClientList onSelect={handleSelectClient} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
