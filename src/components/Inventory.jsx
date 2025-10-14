import React, { useState, useMemo, useRef } from "react";
import "../app.css"
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  themeQuartz,
  ValidationModule,
} from "ag-grid-community";
import { RowNumbersModule } from "ag-grid-enterprise";


ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  AllCommunityModule,
  RowNumbersModule,
  ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);
import inventoryStock from "../data/inventory";

// ModuleRegistry.registerModules([AllCommunityModule]);

const myTheme = themeQuartz.withParams({
  sideBarBackgroundColor: "#08f3",
  sideButtonBarBackgroundColor: "#fff6",
  sideButtonBarTopPadding: 20,
  sideButtonSelectedUnderlineColor: "orange",
  sideButtonTextColor: "#0009",
  sideButtonHoverBackgroundColor: "#fffa",
  sideButtonSelectedBackgroundColor: "#08f1",
  sideButtonHoverTextColor: "#000c",
  sideButtonSelectedTextColor: "#000e",
  sideButtonSelectedBorder: false,
});

const InventoryGrid = () => {
  const gridRef = useRef();

  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);

  const [rowData, setRowData] = useState(inventoryStock);

  const [columnDefs] = useState([
    { field: "name", minWidth: 150 },
    { 
      field: "price", 
      valueFormatter: (params) => `R${params.value.toLocaleString()}` 
    },
    { field: "onHand" },
    { 
      field: "dateReceived", 
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    { 
      field: "lastSale", 
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    { field: "supplier" },
  ]);

  const defaultColDef = useMemo(() => ({
    editable: true,
    filter: true,
    enableRowGroup: true,
    enablePivot: true,
    enableValue: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
  }), []);

  const theme = useMemo(() => myTheme, []);

  // Export CSV
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

  return (
    <div style={containerStyle}>
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
      </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
      <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          sideBar={true}
          rowNumbers={true}
          theme={theme}
        />
        </div>
        </div>
      </div>
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
