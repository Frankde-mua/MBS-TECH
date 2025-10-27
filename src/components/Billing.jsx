import React, { useState, useEffect } from "react";
import ClientList from "./Utlies/ClientList";
import QuickServiceSection from "./Utlies/QuickServiceSection";

/* Example / quick data */
const BILLING_SERVICES = [
  { id: 1, name: "Website Hosting", price: 150 },
  { id: 2, name: "SEO Optimization", price: 300 },
];

const DUMMY_TARIFFS = [
  { id: 1, code: "TAR001", desc: "Eye Test", fee: 200 },
  { id: 2, code: "TAR002", desc: "Spectacle Frame", fee: 800 },
  { id: 3, code: "TAR003", desc: "Lens Fitting", fee: 400 },
];

const blankRow = () => ({
  id: Math.random().toString(36).slice(2, 9),
  tariff: "", // tariff name/desc
  tariffCode: "",
  qty: 1,
  narrative: "",
  discount: 0,
  fee: 0,
  lens: "None",
  barcode: "",
  stockLink: null,
});

export default function Billing() {
  const [selectedServices, setSelectedServices] = useState([]);
  const [billingRows, setBillingRows] = useState([blankRow()]);
  const [manualService, setManualService] = useState("");
  const [discountService, setDiscountService] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showTariffModal, setShowTariffModal] = useState(false);
  const [tariffModalTargetRowId, setTariffModalTargetRowId] = useState(null); // which row to fill
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

  const toggleService = (id) =>
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const updateRow = (id, patch) =>
    setBillingRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addRow = (row = null) =>
    setBillingRows((rows) => (row ? [...rows, row] : [...rows, blankRow()]));

  const clearTable = () => setBillingRows([blankRow()]);

  const handleAddManual = () => {
    if (!manualService || !manualPrice) return;
    addRow({
      ...blankRow(),
      tariff: manualService,
      fee: Number(manualPrice),
      discount: discountService ? Number(discountService) : 0,
    });
    setManualService("");
    setManualPrice("");
    setDiscountService("");
  };

  // ----- FIXED: select tariff and place into correct row -----
  const selectTariffToRow = (tariff) => {
    setBillingRows((rows) => {
      // If a specific row was targeted, fill that row
      if (tariffModalTargetRowId) {
        return rows.map((r) =>
          r.id === tariffModalTargetRowId
            ? { ...r, tariff: tariff.desc, tariffCode: tariff.code, fee: tariff.fee, discount: 0 }
            : r
        );
      }

      // Otherwise find the first row with an empty tariff
      const firstEmptyIndex = rows.findIndex((r) => !r.tariff || r.tariff.trim() === "");
      if (firstEmptyIndex !== -1) {
        const newRows = [...rows];
        newRows[firstEmptyIndex] = {
          ...newRows[firstEmptyIndex],
          tariff: tariff.desc,
          tariffCode: tariff.code,
          fee: tariff.fee,
          discount: 0,
        };
        return newRows;
      }

      // If no empty row, append a new row with the tariff
      return [
        ...rows,
        {
          ...blankRow(),
          tariff: tariff.desc,
          tariffCode: tariff.code,
          fee: tariff.fee,
          discount: 0,
        },
      ];
    });

    setTariffModalTargetRowId(null);
    setShowTariffModal(false);
  };
  // -----------------------------------------------------------

  // Totals compute across billingRows + selectedServices
  const rowsTotal = billingRows.reduce((sum, r) => {
    const discountAmount = (Number(r.fee || 0) * (Number(r.discount || 0) || 0)) / 100;
    const rowTotal = (Number(r.fee || 0) - discountAmount) * (Number(r.qty || 1) || 1);
    return sum + rowTotal;
  }, 0);

  const servicesTotal = selectedServices.reduce((sum, id) => {
    const svc = BILLING_SERVICES.find((s) => s.id === id);
    return sum + (svc ? svc.price : 0);
  }, 0);

  const totalBilling = rowsTotal + servicesTotal;
  const totalVAt = totalBilling * 0.15;

  const handleSave = () => {
    console.log("Save billingRows:", billingRows);
    alert("Save (placeholder) — check console");
  };
  const handleConvertQuote = () => {
    console.log("Convert quote - placeholder");
    alert("Convert Quote (placeholder)");
  };

  const userData = JSON.parse(localStorage.getItem("userProfile") || "{}");

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Billing</h1>
          <p className="text-sm text-slate-600">Create invoices</p>
        </div>
      </header>

      <div className="overflow-y-auto pr-2 space-y-6 pb-10">
        {/* Quick Services */}
      <QuickServiceSection
        selectedServices={selectedServices}
        toggleService={toggleService}
        addBillingRow={(service) => setBillingRows(prev => [...prev, service])}
        removeBillingRow={(service) => setBillingRows(prev => prev.filter(r => r.id !== service.id))}
      />


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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Rate */}
            <div className="flex flex-col w-full">
              <label className="font-semibold mb-1">Rate</label>
              <div className="flex w-full gap-2">
                <select className="border rounded-lg p-2 w-full text-sm">
                  <option>SAOA</option>
                  <option>Private</option>
                  <option>Medical Aid</option>
                </select>
                <button
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                  onClick={() => setShowRateModal(true)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Sales Person */}
            <div className="flex flex-col w-full">
              <label className="font-semibold mb-1">Sales Person</label>
              <div className="flex w-full gap-2">
                <select className="border rounded-lg p-2 w-full text-sm">
                  <option>NONE</option>
                  <option>John</option>
                  <option>Mary</option>
                </select>
                <button
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                  onClick={() => setShowSalesModal(true)}
                >
                  +
                </button>
              </div>
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

        {/* Manual Add (above tariff grid) */}
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Add Tariff / Manual Billing</h2>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <input
              type="text"
              placeholder="Tariff Name"
              value={manualService}
              onChange={(e) => setManualService(e.target.value)}
              className="border rounded-lg p-2 flex-1 text-sm"
            />
            <input
              type="number"
              placeholder="Discount %"
              value={discountService}
              onChange={(e) => setDiscountService(e.target.value)}
              className="border rounded-lg p-2 w-32 text-sm"
            />
            <input
              type="number"
              placeholder="Fee (R)"
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
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setBillingRows((r) => (r.length ? r.slice(0, -1) : r))}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                title="Remove last row"
              >
                Remove Last
              </button>
            </div>
          </div>
        </div>

        {/* Tariff Grid */}
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <button onClick={handleSave} className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm">
                Save
              </button>
              <button onClick={() => addRow()} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                Add Row
              </button>
              <button onClick={clearTable} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                Clear Table
              </button>
              <button onClick={() => { setTariffModalTargetRowId(null); setShowTariffModal(true); }} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                Tariff Wizard
              </button>
              <button onClick={handleConvertQuote} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                Convert Quote
              </button>
            </div>

            <div className="text-sm text-slate-600">Rows: {billingRows.length}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border table-fixed">
              <colgroup>
                <col style={{ width: "18%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>

              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-2 text-left">Tariff</th>
                  <th className="p-2 text-left">Stock</th>
                  <th className="p-2 text-left">Qty</th>
                  <th className="p-2 text-left">Narrative</th>
                  <th className="p-2 text-left">Discount</th>
                  <th className="p-2 text-left">Fee</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2 text-left">Lens</th>
                  <th className="p-2 text-left">Barcode</th>
                </tr>
              </thead>

              <tbody>
                {/* Top blank row */}
                <tr className="border-t">
                  <td className="p-2">
                    <div className="flex gap-2 items-center">
                      <button
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                        onClick={() => {
                          setTariffModalTargetRowId(billingRows[0]?.id || null);
                          setShowTariffModal(true);
                        }}
                        title="Open Tariff Wizard"
                      >
                        ...
                      </button>
                      <input
                        type="text"
                        placeholder="Select or enter tariff"
                        value={billingRows[0]?.tariff || ""}
                        onChange={(e) => updateRow(billingRows[0].id, { tariff: e.target.value })}
                        className="border rounded p-1 text-xs w-full"
                      />
                    </div>
                  </td>

                  <td className="p-2">
                    <button className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-sm">...</button>
                  </td>

                  <td className="p-2 w-16">
                    <input
                      type="number"
                      className="border rounded p-1 w-full text-xs"
                      value={billingRows[0]?.qty || 1}
                      onChange={(e) => updateRow(billingRows[0].id, { qty: Number(e.target.value || 1) })}
                      min="1"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      className="border rounded p-1 text-xs w-full"
                      value={billingRows[0]?.narrative || ""}
                      onChange={(e) => updateRow(billingRows[0].id, { narrative: e.target.value })}
                      placeholder="Narrative"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      className="border rounded p-1 text-xs w-full"
                      value={billingRows[0]?.discount || 0}
                      onChange={(e) => updateRow(billingRows[0].id, { discount: Number(e.target.value || 0) })}
                      min="0"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      className="border rounded p-1 text-xs w-full"
                      value={billingRows[0]?.fee || 0}
                      onChange={(e) => updateRow(billingRows[0].id, { fee: Number(e.target.value || 0) })}
                      min="0"
                    />
                  </td>

                  <td className="p-2">
                    {(() => {
                      const r = billingRows[0];
                      const discountAmount = (Number(r.fee || 0) * (Number(r.discount || 0) || 0)) / 100;
                      const total = (Number(r.fee || 0) - discountAmount) * (Number(r.qty || 1) || 1);
                      return `R${total.toFixed(2)}`;
                    })()}
                  </td>

                  <td className="p-2">
                    <select
                      className="border rounded p-1 text-xs w-full"
                      value={billingRows[0]?.lens || "None"}
                      onChange={(e) => updateRow(billingRows[0].id, { lens: e.target.value })}
                    >
                      <option>None</option>
                      <option>Lens A</option>
                      <option>Lens B</option>
                    </select>
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      className="border rounded p-1 text-xs w-full"
                      value={billingRows[0]?.barcode || ""}
                      onChange={(e) => updateRow(billingRows[0].id, { barcode: e.target.value })}
                      placeholder="Barcode"
                    />
                  </td>
                </tr>

                {/* Render other rows */}
                {billingRows.slice(1).map((r) => {
                  const discountAmount = (Number(r.fee || 0) * (Number(r.discount || 0) || 0)) / 100;
                  const rowTotal = (Number(r.fee || 0) - discountAmount) * (Number(r.qty || 1) || 1);

                  return (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">
                        <div className="flex gap-2 items-center">
                          <button
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                            onClick={() => {
                              setTariffModalTargetRowId(r.id);
                              setShowTariffModal(true);
                            }}
                            title="Open Tariff Wizard"
                          >
                            ...
                          </button>
                          <input
                            type="text"
                            value={r.tariff}
                            onChange={(e) => updateRow(r.id, { tariff: e.target.value })}
                            className="border rounded p-1 text-xs w-full"
                          />
                        </div>
                      </td>

                      <td className="p-2">
                        <button className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-sm">...</button>
                      </td>

                      <td className="p-2 w-16">
                        <input
                          type="number"
                          value={r.qty}
                          onChange={(e) => updateRow(r.id, { qty: Number(e.target.value || 1) })}
                          className="border rounded p-1 w-full text-xs"
                          min="1"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="text"
                          value={r.narrative}
                          onChange={(e) => updateRow(r.id, { narrative: e.target.value })}
                          className="border rounded p-1 text-xs w-full"
                          placeholder="Narrative"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          value={r.discount}
                          onChange={(e) => updateRow(r.id, { discount: Number(e.target.value || 0) })}
                          className="border rounded p-1 text-xs w-full"
                          min="0"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          value={r.fee}
                          onChange={(e) => updateRow(r.id, { fee: Number(e.target.value || 0) })}
                          className="border rounded p-1 text-xs w-full"
                          min="0"
                        />
                      </td>

                      <td className="p-2">R{rowTotal.toFixed(2)}</td>

                      <td className="p-2">
                        <select
                          className="border rounded p-1 text-xs w-full"
                          value={r.lens}
                          onChange={(e) => updateRow(r.id, { lens: e.target.value })}
                        >
                          <option>None</option>
                          <option>Lens A</option>
                          <option>Lens B</option>
                        </select>
                      </td>

                      <td className="p-2">
                        <input
                          type="text"
                          value={r.barcode}
                          onChange={(e) => updateRow(r.id, { barcode: e.target.value })}
                          className="border rounded p-1 text-xs w-full"
                          placeholder="Barcode"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Billing Summary</h2>
          <table className="w-full text-sm border-t">
            <tbody>
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
          <div className="mt-4">
            <button
              onClick={() => setShowInvoice(true)}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
            >
              Generate Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Tariff Wizard Modal */}
      {showTariffModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg relative">
            <button
              onClick={() => { setShowTariffModal(false); setTariffModalTargetRowId(null); }}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-3">Tariff Wizard</h3>
            <p className="text-xs text-slate-500 mb-3">Click a tariff to insert into the row.</p>

            <table className="w-full text-sm border">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 text-left">Code</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Fee</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_TARIFFS.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t hover:bg-slate-50 cursor-pointer"
                    onClick={() => selectTariffToRow(t)}
                  >
                    <td className="p-2">{t.code}</td>
                    <td className="p-2">{t.desc}</td>
                    <td className="p-2">R{t.fee.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setShowTariffModal(false); setTariffModalTargetRowId(null); }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice modal */}
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
              {userData.logo && (
                <img src={userData.logo} alt="Logo" className="w-16 h-16 mx-auto rounded-full mb-2" />
              )}
              <h2 className="text-xl font-semibold">{userData.company || "Your Company"}</h2>
              <p className="text-sm text-slate-500">{userData.email || "email@example.com"}</p>
            </div>

            <div>
              <p><strong>Invoice no:</strong> #00001</p>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              <p><strong>Name:</strong> {selectedClient?.name}</p>
              <p><strong>Surname:</strong> {selectedClient?.surname}</p>
              <p><strong>Cell:</strong> {selectedClient?.cell}</p>
            </div>

            <br />
            <table className="w-full text-sm border-t">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Tariff</th>
                  <th className="py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {billingRows.map((r) => {
                  const discountAmount = (r.fee * (Number(r.discount || 0))) / 100;
                  const discountedPrice = r.fee - discountAmount;
                  const total = discountedPrice * (r.qty || 1);
                  return (
                    <tr key={r.id} className="border-b">
                      <td className="py-2">{r.tariff}</td>
                      <td className="py-2">R{total.toFixed(2)}</td>
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
              <button onClick={() => window.print()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

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
}
