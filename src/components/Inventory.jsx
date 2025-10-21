import React, { useState, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { motion } from "framer-motion";
import { TopSaleList, LeastSales, OrderTracking } from "./Utlies/InventoryList";
import StockForm from "./Utlies/StockForm";
import inventoryStock from "../data/inventory";

const InventoryGrid = ({ setLoading }) => {
  const gridRef = useRef();
  const [rowData, setRowData] = useState(inventoryStock);
  const [modalOpen, setModalOpen] = useState(null); // "top" | "least" | "order" | null
  const [showAddModal, setShowAddModal] = useState(false);

  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const defaultColDef = useMemo(() => ({
    editable: true,
    filter: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
  }), []);

  const columnDefs = [
    { field: "name", minWidth: 150 },
    { field: "price", valueFormatter: (p) => `R${p.value.toLocaleString()}` },
    { field: "onHand" },
    { field: "dateReceived", valueFormatter: (p) => new Date(p.value).toLocaleDateString() },
    { field: "lastSale", valueFormatter: (p) => new Date(p.value).toLocaleDateString() },
    { field: "supplier" },
  ];

  const handleExport = () => {
    gridRef.current.api.exportDataAsCsv({ fileName: "inventory.csv" });
  };

  // Import CSV
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split("\n").filter(l => l.trim() !== "");
      const headers = lines[0].split(",");
      const data = lines.slice(1).map(line => {
        const values = line.split(",");
        let obj = {};
        headers.forEach((h, idx) => {
          if (h === "price" || h === "onHand") obj[h] = Number(values[idx]);
          else obj[h] = values[idx];
        });
        return obj;
      });
      setRowData(data);
    };
    reader.readAsText(file);
  };

  const handleAddClick = () => {
    setLoading(true);
    setTimeout(() => {
      setShowAddModal(true);
      setLoading(false);
    }, 1500); // Loader duration before modal
  };

  return (
    <div style={containerStyle}>
      {/* --- Stock Inventory Table --- */}
      <div className="mb-4">
        <div className="mb-2 flex gap-2">
          <button
            onClick={handleExport}
            className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
          >
            Export CSV
          </button>
          <label className="bg-indigo-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-indigo-700">
            Import CSV
            <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
          </label>
          <button
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            onClick={handleAddClick}
          >
            Add
          </button>
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
          >
            Print
          </button>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <div className="ag-theme-alpine" style={{ height: "300px", width: "100%" }}>
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              rowNumbers={true}
              headerHeight={35}
              rowHeight={30}
            />
          </div>
        </div>
      </div>

      {/* 🟦 Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-lg overflow-y-auto p-6 relative">
            <h2 className="text-2xl font-bold mb-4 text-center">Add Stock</h2>
            <StockForm />
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* --- Three Cards --- */}
        {/* --- Three Cards --- */}
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.2 },
    },
  }}
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
>
  {[
    {
      title: "🔥 Top Sold Items",
      bg: "bg-green-300",
      component: <TopSaleList />,
      modal: "top",
    },
    {
      title: "🥈 Least Sold Items",
      bg: "bg-red-400",
      component: <LeastSales />,
      modal: "least",
    },
    {
      title: "🚚 Order Tracking",
      bg: "bg-slate-100",
      component: <OrderTracking />,
      modal: "order",
    },
  ].map((card, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
      }}
      transition={{ type: "spring", stiffness: 120 }}
      className={`${card.bg} p-4 rounded-2xl shadow-sm cursor-pointer transition-all duration-300`}
      onClick={() => setModalOpen(card.modal)}
    >
      <h4 className="text-2xl font-semibold mb-2">{card.title}</h4>
      {card.component}
    </motion.div>
  ))}
</motion.div>


      {/* --- Modal Overlay --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 h-[90vh] overflow-auto animate-fadeIn relative">
            {/* Close button */}
            <button
              onClick={() => setModalOpen(null)}
              className="absolute top-4 right-6 text-gray-600 text-lg hover:text-black"
            >
              ✖
            </button>

            {/* Dynamic header */}
            <h2 className="text-2xl font-semibold mb-4">
              {modalOpen === "top" && "🔥 Top Sold Items"}
              {modalOpen === "least" && "🥈 Least Sold Items"}
              {modalOpen === "order" && "🚚 Order Tracking"}
            </h2>

            {/* Modal content */}
            {modalOpen === "top" && <TopSaleList />}
            {modalOpen === "least" && <LeastSales />}
            {modalOpen === "order" && <OrderTracking />}
          </div>
        </div>
      )}
    </div>
  );
};

const renderInventory = ({ setLoading }) => (
  <div>
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-slate-600">Goods control and management.</p>
      </div>
    </header>
    <InventoryGrid setLoading={setLoading} />
  </div>
);

export default renderInventory;