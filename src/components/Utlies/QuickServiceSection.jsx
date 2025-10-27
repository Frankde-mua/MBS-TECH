// 🟦 Quick Services Section
import React, { useState } from "react";

const BILLING_SERVICES = [
  { id: 1, name: "Eye Ekzam", price: 150 },
  { id: 2, name: "SEO Optimization", price: 300 },
  { id: 3, name: "Email Marketing", price: 200 },
  { id: 4, name: "Social Media Management", price: 400 },
  { id: 5, name: "Graphic Design", price: 250 },
  { id: 6, name: "App Maintenance", price: 350 },
  { id: 7, name: "Consultation", price: 180 },
  { id: 8, name: "Domain Registration", price: 120 },
  { id: 9, name: "Cloud Storage", price: 500 },
  { id: 10, name: "Technical Support", price: 220 },
];

export default function QuickServiceSection({
  selectedServices,
  toggleService,
  addBillingRow, // function to add to main billing grid
  removeBillingRow, // function to remove from main billing grid
}) {
  const [quickServices, setQuickServices] = useState(BILLING_SERVICES.slice(0, 6));
  const [showSelector, setShowSelector] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState(null);

  const handleQuickServiceClick = (service) => {
    toggleService(service.id);
    if (selectedServices.includes(service.id)) {
      removeBillingRow(service);
    } else {
      addBillingRow(service);
    }
  };

  const handleAddNewClick = (index) => {
    setReplaceIndex(index);
    setShowSelector(true);
  };

  const handleSelectNewService = (service) => {
    const updated = [...quickServices];
    updated[replaceIndex] = service;
    setQuickServices(updated);
    setShowSelector(false);
    setReplaceIndex(null);
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h2 className="text-sm font-semibold mb-4">Quick Service Selection</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickServices.map((s, index) => (
          <div
            key={s.id}
            onClick={() => handleQuickServiceClick(s)}
            className={`p-3 rounded-lg border cursor-pointer transition ${
              selectedServices.includes(s.id)
                ? "border-indigo-400 bg-indigo-50"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{s.name}</div>
                <div className="text-xs text-slate-500">R{s.price}.00</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddNewClick(index);
                }}
                className="text-indigo-600 text-lg font-bold ml-2 hover:text-indigo-800"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🟦 Tariff Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
            <h3 className="text-lg font-semibold mb-3">Select a New Quick Service</h3>

            <div className="max-h-80 overflow-y-auto border rounded-lg divide-y">
              {BILLING_SERVICES.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectNewService(s)}
                  className="p-3 cursor-pointer hover:bg-indigo-50 transition"
                >
                  <div className="flex justify-between">
                    <span>{s.name}</span>
                    <span className="text-slate-500 text-sm">R{s.price}.00</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowSelector(false)}
              className="mt-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg px-4 py-2 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
