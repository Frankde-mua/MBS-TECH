import React, { useState, useRef, useMemo } from "react";
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

const Expenditure = () => {
  const gridRef = useRef();
  const [expenses, setExpenses] = useState([]);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "",
    description: "",
    amount: "",
  });

  const columnDefs = useMemo(
    () => [
      { field: "date", headerName: "Date", minWidth: 120 },
      { field: "category", headerName: "Category", minWidth: 150 },
      { field: "description", headerName: "Description", flex: 1 },
      {
        field: "amount",
        headerName: "Amount",
        minWidth: 120,
        valueFormatter: (params) => `R${Number(params.value).toFixed(2)}`,
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const handleAddExpense = () => {
    if (!form.category || !form.description || !form.amount) return;
    setExpenses((prev) => [...prev, { ...form, amount: parseFloat(form.amount) }]);
    setForm({ ...form, category: "", description: "", amount: "" });
  };

  const handleExport = () => {
    gridRef.current.api.exportDataAsCsv({ fileName: "expenses.csv" });
  };

  const handlePrint = () => {
    const printContent = document.getElementById("expense-grid");
    const win = window.open("", "", "width=900,height=700");
    win.document.write(printContent.outerHTML);
    win.document.close();
    win.print();
  };

  return (
    <div>
        {/* Header */}
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Company Expenses</h1>
        <p className="text-sm text-slate-600">Record daily expenses.</p>
      </header>

      {/* Add Expense Form */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="px-3 py-1 border rounded"
        />
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="px-3 py-1 border rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="px-3 py-1 border rounded flex-1"
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="px-3 py-1 border rounded w-32"
        />
        <button
          onClick={handleAddExpense}
          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          Add
        </button>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          Export CSV
        </button>
        <button
          onClick={handlePrint}
          className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
        >
          Print
        </button>
      </div>

      {/* Expense Table */}
      <div id="expense-grid" className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={expenses}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
        />
      </div>
    </div>
  );
};

export default Expenditure;
