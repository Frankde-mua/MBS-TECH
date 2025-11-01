import React, { useState, useEffect } from "react";

// 🧩 Section Components
import ClientDetails from "./sections/ClientDetails";
import PrescriptionForm from "./sections/PrescriptionForm";
import ManualAddSection from "./sections/ManualAddSection";
import TariffGrid from "./sections/TariffGrid";
import BillingSummary from "./sections/BillingSummary";

// 🪟 Modal Components
import TariffWizardModal from "./modals/TariffWizardModal";
import InvoiceModal from "./modals/InvoiceModal";
import RateModal from "./modals/RateModal";
import SalesModal from "./modals/SalesModal";
import ClientModal from "./modals/ClientModal";

// ⚙️ Utilities
import QuickServiceSection from "./Utlies/QuickServiceSection";
import { BILLING_SERVICES, DUMMY_TARIFFS, blankRow } from "./utils/billingUtils";

export default function Billing() {
  // ========== STATE ==========
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClients, setShowClients] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showTariffModal, setShowTariffModal] = useState(false);
  const [tariffModalTargetRowId, setTariffModalTargetRowId] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);

  const [billingRows, setBillingRows] = useState([blankRow()]);
  const [manualService, setManualService] = useState("");
  const [discountService, setDiscountService] = useState(0);
  const [manualPrice, setManualPrice] = useState(0);

  const [userData, setUserData] = useState({
    logo: null,
    company: "Your Company",
    email: "info@example.com",
  });

  // 🧾 Prescription + ICD-10
  const [prescription, setPrescription] = useState({
    right: { sphere: 0, cyl: 0, axis: 0, add: 0 },
    left: { sphere: 0, cyl: 0, axis: 0, add: 0 },
  });

  const [icd10Codes, setIcd10Codes] = useState([]);

  // ========== BILLING LOGIC ==========
  const addRow = () => setBillingRows((prev) => [...prev, blankRow()]);

  const updateRow = (id, updates) => {
    setBillingRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const clearTable = () => setBillingRows([blankRow()]);

  const handleAddManual = () => {
    if (!manualService || !manualPrice) return;
    setBillingRows((prev) => [
      ...prev,
      {
        ...blankRow(),
        tariff: manualService,
        fee: Number(manualPrice),
        discount: Number(discountService),
      },
    ]);
    setManualService("");
    setManualPrice("");
    setDiscountService("");
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setShowClients(false);
  };

  const selectTariffToRow = (tariff) => {
    if (!tariffModalTargetRowId) return;
    updateRow(tariffModalTargetRowId, {
      tariff: tariff.desc,
      tariffCode: tariff.code,
      fee: tariff.fee,
    });
    setShowTariffModal(false);
    setTariffModalTargetRowId(null);
  };

  const handleSave = () => {
    console.log("Saving billing data:", billingRows);
    alert("Billing data saved successfully!");
  };

  const handleConvertQuote = () => {
    alert("Quote converted successfully!");
  };

  // ========== TOTALS ==========
  const totalBilling = billingRows.reduce((sum, r) => {
    const discountAmount = (r.fee * (Number(r.discount || 0))) / 100;
    const discountedPrice = r.fee - discountAmount;
    return sum + discountedPrice * (r.qty || 1);
  }, 0);

  const totalVAt = totalBilling * 0.15; // 15% VAT

  // ========== EFFECTS ==========
  useEffect(() => {
    const savedData = localStorage.getItem("userData");
    if (savedData) setUserData(JSON.parse(savedData));
  }, []);

  // ========== RENDER ==========
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Billing</h1>
          <p className="text-sm text-slate-600">Create invoices for clients</p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="overflow-y-auto pr-2 space-y-6 pb-10">
        {/* Quick Services */}
        <QuickServiceSection
          BILLING_SERVICES={BILLING_SERVICES}
          billingRows={billingRows}
          setBillingRows={setBillingRows}
        />

        {/* Client Section */}
        <ClientDetails
          selectedClient={selectedClient}
          setShowClients={setShowClients}
        />

        {/* Prescription Section */}
        <PrescriptionForm
          prescription={prescription}
          setPrescription={setPrescription}
          setIcd10Codes={setIcd10Codes}
        />

        {/* Manual Add Section */}
        <ManualAddSection
          manualService={manualService}
          discountService={discountService}
          manualPrice={manualPrice}
          setManualService={setManualService}
          setDiscountService={setDiscountService}
          setManualPrice={setManualPrice}
          handleAddManual={handleAddManual}
          setBillingRows={setBillingRows}
        />

        {/* Tariff Table */}
        <TariffGrid
          billingRows={billingRows}
          updateRow={updateRow}
          addRow={addRow}
          clearTable={clearTable}
          handleSave={handleSave}
          handleConvertQuote={handleConvertQuote}
          setTariffModalTargetRowId={setTariffModalTargetRowId}
          setShowTariffModal={setShowTariffModal}
        />

        {/* Billing Summary */}
        <BillingSummary
          totalVAt={totalVAt}
          totalBilling={totalBilling}
          setShowInvoice={setShowInvoice}
        />
      </div>

      {/* ========== MODALS ========== */}
      {showClients && (
        <ClientModal
          showClients={showClients}
          handleSelectClient={handleSelectClient}
        />
      )}

      {showTariffModal && (
        <TariffWizardModal
          setShowTariffModal={setShowTariffModal}
          setTariffModalTargetRowId={setTariffModalTargetRowId}
          selectTariffToRow={selectTariffToRow}
          DUMMY_TARIFFS={DUMMY_TARIFFS}
        />
      )}

      {showInvoice && (
        <InvoiceModal
          showInvoice={showInvoice}
          setShowInvoice={setShowInvoice}
          billingRows={billingRows}
          selectedClient={{ ...selectedClient, prescription }} // 👈 include prescription
          userData={userData}
          totalVAt={totalVAt}
          totalBilling={totalBilling}
          icd10Codes={icd10Codes}
        />
      )}

      {showRateModal && (
        <RateModal show={showRateModal} onClose={() => setShowRateModal(false)} />
      )}

      {showSalesModal && (
        <SalesModal show={showSalesModal} onClose={() => setShowSalesModal(false)} />
      )}
    </div>
  );
}
