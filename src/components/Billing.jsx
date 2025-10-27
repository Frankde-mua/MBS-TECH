import React, { useState, useEffect } from "react";
import ClientList from "./Utlies/ClientList";

const BILLING_SERVICES = [
  { id: 1, name: "Website Hosting", price: 150 },
  { id: 2, name: "SEO Optimization", price: 300 },
  { id: 3, name: "Email Marketing", price: 200 },
  { id: 4, name: "Social Media Management", price: 400 },
];

const Billing = () => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [manualService, setManualService] = useState("");
  const [discountService, setDiscountService] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualList, setManualList] = useState([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

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

  const totalBilling =
    selectedServices.reduce((sum, id) => {
      const svc = BILLING_SERVICES.find((s) => s.id === id);
      return sum + (svc ? svc.price : 0);
    }, 0) +
    manualList.reduce((sum, m) => {
      const discountAmount = (m.price * (Number(m.discount) || 0)) / 100;
      return sum + (m.price - discountAmount);
    }, 0);

  const totalVAt = totalBilling * 0.15;

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
    <div className="h-screen overflow-hidden flex flex-col">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Billing</h1>
          <p className="text-sm text-slate-600">Create some invoices.</p>
        </div>
      </header>

      {/* Scrollable container */}
      <div className="overflow-y-auto pr-2 space-y-6 pb-10">

        {/* 🟦 Quick Services */}
        <div className="bg-white p-4 rounded-2xl shadow-sm">
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
                <div className="text-xs text-slate-500">R{s.price}.00</div>
              </div>
            ))}
          </div>
        </div>

        {/* 🟦 Client Details */}
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Client Details</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="First Name"
              value={selectedClient?.name || ""}
              className="border rounded-lg p-2 flex-1 text-sm"
              disabled
            />
            <input
              type="text"
              placeholder="Last Name"
              value={selectedClient?.surname || ""}
              className="border rounded-lg p-2 flex-1 text-sm"
              disabled
            />
            <input
              type="text"
              placeholder="Email"
              value={selectedClient?.email || ""}
              className="border rounded-lg p-2 flex-1 text-sm"
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
            <div className="mt-3 text-xs text-slate-500">
              <p><strong>Cell:</strong> {selectedClient.cell}</p>
              <p><strong>Type:</strong> {selectedClient.type}</p>
              <p><strong>Address:</strong> {selectedClient.address}</p>
            </div>
          )}
        </div>

        {/* 🟦 Prescription Headers */}
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            {/* Rate */}
            <div className="flex items-center justify-between">
              <span className="font-semibold">Rate</span>
              <select className="border rounded-lg p-2 w-full text-sm">
                <option>SAOA</option>
                <option>Private</option>
                <option>Medical Aid</option>
              </select>
              <button
                className="ml-2 px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                onClick={() => setShowRateModal(true)}
              >
                +
              </button>
            </div>

            {/* Sales Person */}
            <div className="flex items-center justify-between">
              <span className="font-semibold">Sales Person</span>
              <select className="border rounded-lg p-2 w-full text-sm">
                <option>NONE</option>
                <option>John</option>
                <option>Mary</option>
              </select>
              <button
                className="ml-2 px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                onClick={() => setShowSalesModal(true)}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 🟦 Prescription */}
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Prescription</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border table-fixed">
              <colgroup>
                <col style={{ width: "8%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>

              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-2 text-left">Eye</th>
                  <th className="p-2 text-left">Sphere</th>
                  <th className="p-2 text-left">Cyl</th>
                  <th className="p-2 text-left">Axis</th>
                  <th className="p-2 text-left">Prism</th>
                  <th className="p-2 text-left">Base</th>
                  <th className="p-2 text-left">Add</th>
                  <th className="p-2 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {["Right", "Left"].map((eye) => (
                  <tr key={eye} className="border-t">
                    <td className="p-2 font-medium">{eye}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <select className="border rounded p-1 text-xs w-12">
                          <option>+</option>
                          <option>-</option>
                        </select>
                        <input
                          type="number"
                          step="0.25"
                          className="border rounded p-1 text-xs w-full"
                          defaultValue="0.00"
                        />
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <select className="border rounded p-1 text-xs w-12">
                          <option>+</option>
                          <option>-</option>
                        </select>
                        <input
                          type="number"
                          step="0.25"
                          className="border rounded p-1 text-xs w-full"
                          defaultValue="0.00"
                        />
                      </div>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className="border rounded p-1 text-xs w-full"
                        defaultValue="0"
                        min="0"
                        max="180"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        className="border rounded p-1 text-xs w-full"
                        defaultValue="0.00"
                      />
                    </td>
                    <td className="p-2">
                      <select className="border rounded p-1 text-xs w-full">
                        <option>Up</option>
                        <option>Down</option>
                        <option>In</option>
                        <option>Out</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.25"
                        className="border rounded p-1 text-xs w-full"
                        defaultValue="0.00"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="date"
                        className="border rounded p-1 text-xs w-full"
                        defaultValue={new Date().toISOString().slice(0, 10)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🟦 Manual Add */}
        <div className="bg-white p-4 rounded-2xl shadow-sm">
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
              placeholder="Discount in %"
              value={discountService}
              onChange={(e) => setDiscountService(e.target.value)}
              className="border rounded-lg p-2 w-32 text-sm"
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

        {/* 🟦 Summary */}
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
                    <td className="py-2">
                        {discount > 0 ? `${discount}%` : "—"}
                    </td>

                    {/* Price column logic */}
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
                <td className="py-2 font-medium">Vat</td>
                <td></td>
                <td className="py-2 font-semibold">R{totalVAt.toFixed(2)}</td>
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
                {userData.name || "Company email"} — {userData.email || "email@example.com"}
              </p>
              <p className="text-sm text-slate-500"><strong>Tax Invoice</strong></p>
            </div>

            <div>
            <p><strong>Invoice no:</strong> #00001</p>
            </div>
            <div className="mt-3 text-xs text-slate-500">
            <p><strong>Name:</strong> {selectedClient.name}</p>
            <p><strong>Surname:</strong> {selectedClient.surname}</p>
            <p><strong>Cell:</strong> {selectedClient.cell}</p>
            <p><strong>Type:</strong> {selectedClient.type}</p>
            <p><strong>Address:</strong> {selectedClient.address}</p>
            </div>
            <br />
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
                  <td className="py-2 font-semibold">R{totalVAt.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Total</td>
                  <td className="py-2 font-semibold">R{totalBilling.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between mt-6">
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
      </div>

      {/* Modals remain outside */}
      {showRateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-3">Add New Rate</h3>
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mt-3"
              onClick={() => setShowRateModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showSalesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-3">Add New Sales Person</h3>
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mt-3"
              onClick={() => setShowSalesModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showClients && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center w-full max-w-4xl transition-all duration-300">
            <h2 className="text-2xl font-bold mb-4">Client List</h2>
            <ClientList onSelect={handleSelectClient} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;