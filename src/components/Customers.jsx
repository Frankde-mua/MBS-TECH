import React, { useRef, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  themeQuartz,
  ValidationModule,
  iconSetQuartzLight,
} from "ag-grid-community";
import { RowNumbersModule } from "ag-grid-enterprise";
import { CLIENTS } from "../data/clients";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  AllCommunityModule,
  RowNumbersModule,
  ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);

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

export default function ClientGrid({ setCurrentPage }) {
  const theme = useMemo(() => myTheme, []);
  const [rowData, setRowData] = useState(CLIENTS);
  const gridRef = useRef();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const columnDefs = useMemo(
    () => [
      { field: "name", headerName: "Name", sortable: true, filter: true },
      { field: "surname", headerName: "Surname", sortable: true, filter: true },
      { field: "type", headerName: "Client Type", sortable: true, filter: true },
      { field: "cell", headerName: "Cell", sortable: true },
      { field: "email", headerName: "Email", sortable: true },
      { field: "address", headerName: "Address", sortable: true, flex: 1 },
      { field: "banking.bank", headerName: "Bank" },
      { field: "banking.accountNumber", headerName: "Account #" },
      { field: "banking.branchCode", headerName: "Branch Code" },
    ],
    []
  );

  const defaultColDef = { resizable: true, flex: 1 };

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clientel</h1>
      </header>

      {/* ⚡ 3 Cards Section */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        {/* Add Client Card */}
        <div
          onClick={() => setShowAddModal(true)}
          className="w-64 h-36 bg-white rounded-2xl shadow-md flex items-center justify-center cursor-pointer text-lg font-semibold hover:bg-blue-100 transition"
        >
          ➕ Add Client
        </div>

        {/* Update Client Card */}
        <div
          onClick={() => setShowUpdateModal(true)}
          className="w-64 h-36 bg-white rounded-2xl shadow-md flex items-center justify-center cursor-pointer text-lg font-semibold hover:bg-green-100 transition"
        >
          ✏️ Update Client
        </div>

        {/* Bill Client Card */}
        <div
          onClick={() => setCurrentPage("billing")}
          className="w-64 h-36 bg-white rounded-2xl shadow-md flex items-center justify-center cursor-pointer text-lg font-semibold hover:bg-red-100 transition"
        >
          💳 Bill Client
        </div>

      </div>

      {/* ✅ AG Grid Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <div
            className="ag-theme-alpine"
            style={{
              width: "100%",
              // dynamic height: header + rows
              height: `${50 + rowData.length * 35}px`,
            }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              sideBar={true}
              rowNumbers={true}
              theme={theme}
              headerHeight={50}   // optional, matches calculation
              rowHeight={35}      // optional, matches calculation
            />
          </div>
        </div>
      </div>

      {/* 🟦 Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Add Client</h2>
            <p className="mb-4">Form or content for adding a client goes here.</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 🟩 Update Client Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Update Client</h2>
            <p className="mb-4">
              Content or update form for client information goes here.
            </p>
            <button
              onClick={() => setShowUpdateModal(false)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
