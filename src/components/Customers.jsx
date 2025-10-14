import React, { useRef, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  themeQuartz,
  ValidationModule,
  iconSetQuartzLight 
} from "ag-grid-community";
import { RowNumbersModule } from "ag-grid-enterprise";
import { CLIENTS } from "../data/clients";

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    AllCommunityModule,
    RowNumbersModule,
    ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
  ]);

  const myTheme = themeQuartz
  .withPart(iconSetQuartzLight)
  .withParams({
      backgroundColor: "#ffffff",
      browserColorScheme: "light",
      columnBorder: false,
      fontFamily: "Arial",
      foregroundColor: "rgb(46, 55, 66)",
      headerBackgroundColor: "#F9FAFB",
      headerFontSize: 14,
      headerFontWeight: 600,
      headerTextColor: "#919191",
      oddRowBackgroundColor: "#F9FAFB",
      rowBorder: false,
      sidePanelBorder: false,
      spacing: 8,
      wrapperBorder: false,
      wrapperBorderRadius: 0
  });

export default function ClientGrid() {
    const theme = useMemo(() => myTheme, []);
  const [rowData, setRowData] = useState(CLIENTS);
  const gridRef = useRef();

  const columnDefs = useMemo(() => [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Name", sortable: true, filter: true },
    { field: "surname", headerName: "Surname", sortable: true, filter: true },
    { field: "type", headerName: "Client Type", sortable: true, filter: true },
    { field: "cell", headerName: "Cell", sortable: true },
    { field: "email", headerName: "Email", sortable: true },
    { field: "address", headerName: "Address", flex: 1 },
  ], []);

  const defaultColDef = { resizable: true, flex: 1 };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
    <div className="ag-theme-alpine" style={{ width: "100%", height: "500px" }}>
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
  );
}
