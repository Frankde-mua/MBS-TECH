import React, { useState, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  themeQuartz,
  ValidationModule,
} from "ag-grid-community";
import { RowNumbersModule } from "ag-grid-enterprise";
import inventoryStock from "../../data/inventory";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  AllCommunityModule,
  RowNumbersModule,
  ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);

// 🎨 Custom theme setup
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

// 🥇 Top Sales Grid (onHand ≤ 10 AND unitsSold > 30)
const TopSaleList = () => {
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);

  const [rowData] = useState(() =>
    inventoryStock.filter((item) => item.onHand <= 10 && item.unitsSold > 30)
  );

  const [columnDefs] = useState([
    { field: "name", minWidth: 150 },
    { field: "price", valueFormatter: (p) => `R${p.value.toLocaleString()}` },
    { field: "onHand" },
    { field: "unitsSold" },
    {
      headerName: "Total Amount",
      valueGetter: (p) => p.data.price * p.data.unitsSold,
      valueFormatter: (p) => `R${p.value.toLocaleString()}`,
    },
    { field: "supplier" },
  ]);

  const defaultColDef = useMemo(
    () => ({
      editable: false,
      filter: true,
      sortable: true,
      flex: 1,
      minWidth: 100,
    }),
    []
  );

  const handleExportTop = () => {
    gridRef.current.api.exportDataAsCsv({ fileName: "topsale.csv" });
  };

  return (
    <div style={containerStyle}>
      <p className="text-xs pb-2">Items that have been sold more than 30 units and have 10 or fewer in stock in the past month.</p>
      <div className="mb-2 flex gap-2">
        <button
          onClick={handleExportTop}
          className="w-19 h-6 text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
        <div className="ag-theme-quartz" style={{ height: "400px", width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowNumbers={true}
            theme={myTheme}
            headerHeight={25}   // optional, matches calculation
            rowHeight={25}      // optional, matches calculation
          />
        </div>
      </div>
    </div>
  );
};

// 🥈 Least Sales Grid (unitsSold < 10)
const LeastSales = () => {
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);

  const [rowData] = useState(() =>
    inventoryStock.filter((item) => item.unitsSold < 10)
  );

  const [columnDefs] = useState([
    { field: "name", minWidth: 150 },
    { field: "price", valueFormatter: (p) => `R${p.value.toLocaleString()}` },
    { field: "onHand" },
    { field: "unitsSold" },
    {
      headerName: "Total Amount",
      valueGetter: (p) => p.data.price * p.data.unitsSold,
      valueFormatter: (p) => `R${p.value.toLocaleString()}`,
    },
    { field: "supplier" },
  ]);

  const defaultColDef = useMemo(
    () => ({
      editable: false,
      filter: true,
      sortable: true,
      flex: 1,
      minWidth: 100,
    }),
    []
  );

  const handleExportLeast = () => {
    gridRef.current.api.exportDataAsCsv({ fileName: "leastsale.csv" });
  };

  return (
    <div style={containerStyle}>
      <p className="text-xs pb-2">Items that have been sold less than 10 units and have more than 20 in stock in the past month.</p>
      <div className="mb-2 flex gap-2">
        <button
          onClick={handleExportLeast}
          className="w-19 h-6 text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
        <div className="ag-theme-quartz" style={{ height: "400px", width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowNumbers={true}
            theme={myTheme}
            headerHeight={25}   // optional, matches calculation
            rowHeight={25}      // optional, matches calculation
          />
        </div>
      </div>
    </div>
  );
};

// 🚚 Order Tracking Grid
const OrderTracking = () => {
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const [rowData] = useState(
    [...inventoryStock].sort(
      (a, b) => new Date(b.dateReceived) - new Date(a.dateReceived)
    )
  );

  const [columnDefs] = useState([
    { field: "name", minWidth: 150 },
    { field: "supplier" },
    { field: "onHand" },
    {
      field: "dateReceived",
      valueFormatter: (p) => new Date(p.value).toLocaleDateString(),
    },
    {
      field: "lastSale",
      valueFormatter: (p) => new Date(p.value).toLocaleDateString(),
    },
  ]);

  const defaultColDef = useMemo(
    () => ({
      editable: false,
      filter: true,
      sortable: true,
      flex: 1,
      minWidth: 100,
    }),
    []
  );

  const handleExportLastOrdered = () => {
    gridRef.current.api.exportDataAsCsv({ fileName: "lastorder.csv" });
  };

  return (
    <div style={containerStyle}>
      <p className="text-xs pb-2">Items that were received more than 30 days ago and have not been sold in the past 15 days.</p>
      <div className="mb-2 flex gap-2">
        <button
          onClick={handleExportLastOrdered}
          className="w-19 h-6 text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          Export CSV
        </button>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">

        <div className="ag-theme-quartz" style={{ height: "400px", width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowNumbers={true}
            theme={myTheme}
            headerHeight={25}   // optional, matches calculation
            rowHeight={25}      // optional, matches calculation
          />
        </div>
      </div>
    </div>
  );
};

export { TopSaleList, LeastSales, OrderTracking };
export default TopSaleList;
