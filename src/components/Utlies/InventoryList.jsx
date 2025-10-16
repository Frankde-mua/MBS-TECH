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

const TopSaleList = () => {
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
      field: "Unites Sold",
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: "Total Amount",
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

  // Export Top Sale CSV
  const handleExportTop = () => {
    gridRef.current.api.exportDataAsCsv({ fileName: "topsale.csv" });
  };

    // Export Top Sale CSV
    const handleExportLeast = () => {
        gridRef.current.api.exportDataAsCsv({ fileName: "leastsale.csv" });
      };

   // Export Last Ordered CSV
  const handleExportLastOrdered = () => {
    gridRef.current.api.exportDataAsCsv({ fileName: "lastorder.csv" });
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
      </div>
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="ag-theme-alpine" style={{ height: `${40 + rowData.length * 15}px`, width: "100%" }}>
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              sideBar={true}
              rowNumbers={true}
              theme={theme}
              headerHeight={40}   // optional, matches calculation
              rowHeight={35}      // optional, matches calculation
            />
          </div>
        </div>
      </div>
    </div>
  );
};



export default renderInventory;
