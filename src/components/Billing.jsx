import React, { useState } from "react";
import FinancialEnquiries from "./Utlies/Enquiries";
import Payment from "./Utlies/Payment";
import Invoice from "./Utlies/Invoice";
import ETransact from "./Utlies/ETransact";

const SemiNavbar = () => {
  const tabs = ["Enquiries", "Payment", "Invoice", "Credit Note", "Quote", "E-Transact"];
  const [activeTab, setActiveTab] = useState("Enquiries");

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
      <div>
          <h1 className="text-2xl font-semibold">Billing</h1>
          <p className="text-sm text-slate-600">Financial works.</p>
        </div>
        </header>
    <nav className=" px-3 rounded-xl shadow-sm w-full max-w-full overflow-x-auto">
      <ul className="flex space-x-4">
        {tabs.map((tab, idx) => (
          <li key={tab} className="flex items-center">
            <button
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium transition px-2 py-1 rounded-md ${
                activeTab === tab
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab}
            </button>
            {/* Add separator except for last item */}
            {idx < tabs.length - 1 && (
              <span className="text-gray-400 mx-2">{"\\"}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
    <div className="mt-6">
    {activeTab === "Enquiries" && <FinancialEnquiries />}
    {activeTab === "Payment" && <Payment />}
    {activeTab === "Invoice" && <Invoice />}
    {activeTab === "E-Transact" && <ETransact />}
    </div>
    </div>
  );
};

export default SemiNavbar;
