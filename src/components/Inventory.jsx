import React, { useState, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { TopSaleList, LeastSales, OrderTracking } from "./Utlies/InventoryList";
import inventoryStock from "../data/inventory";

const InventoryGrid = () => {
  const gridRef = useRef();
  const [rowData, setRowData] = useState(inventoryStock);
  const [modalOpen, setModalOpen] = useState(null); // "top" | "least" | "order" | null

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

      {/* --- Three Cards --- */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div
          className="bg-green-300 p-4 rounded-2xl shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => setModalOpen("top")}
        >
          <h4 className="text-2xl font-semibold mb-2">🔥 Top Sold Items</h4>
          <TopSaleList />
        </div>

        <div
          className="bg-red-400 p-4 rounded-2xl shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => setModalOpen("least")}
        >
          <h4 className="text-2xl font-semibold mb-2">🥈 Least Sold Items</h4>
          <LeastSales />
        </div>

        <div
          className="bg-slate-100 p-4 rounded-2xl shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => setModalOpen("order")}
        >
          <h4 className="text-2xl font-semibold mb-2">🚚 Order Tracking</h4>
          <OrderTracking />
        </div>
      </div>

      {/* --- Modal Overlay --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 h-[90vh] overflow-auto animate-fadeIn relative">
            <button
              onClick={() => setModalOpen(null)}
              className="absolute top-4 right-6 text-gray-600 text-lg hover:text-black"
            >
              ✖
            </button>
            {modalOpen === "top" && <TopSaleList />}
            {modalOpen === "least" && <LeastSales />}
            {modalOpen === "order" && <OrderTracking />}
          </div>
        </div>
      )}
    </div>
  );
};

const renderInventory = () => (
  <div>
    <header className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold">Inventory</h1>
    </header>
    <p className="mb-4">Welcome to your inventory</p>
    <InventoryGrid />
  </div>
);

export default renderInventory;
