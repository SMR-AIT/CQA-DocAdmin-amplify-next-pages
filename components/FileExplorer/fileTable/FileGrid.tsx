import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import type { Schema } from "@/amplify/data/resource";

// const columns: GridColDef[] = [
//   { field: 'id', headerName: 'ID', width: 70 },
//   { field: 'firstName', headerName: 'First name', width: 130 },
//   { field: 'lastName', headerName: 'Last name', width: 130 },
//   {
//     field: 'age',
//     headerName: 'Age',
//     type: 'number',
//     width: 90,
//   },
//   {
//     field: 'fullName',
//     headerName: 'Full name',
//     description: 'This column has a value getter and is not sortable.',
//     sortable: false,
//     width: 160,
//     valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
//   },
// ];


// const rows = [
//   { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
//   { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
//   { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
//   { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
//   { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
//   { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
//   { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
//   { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
//   { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
// ];

type Doc = Schema["Doc"]["type"];

const columns: GridColDef[] = [
  { field: 'name', headerName: '檔名', width: 70 },
  { field: 'pdf', headerName: '轉出pdf檔', width: 130 },
  { field: 'text', headerName: '擷取文字', width: 130 },
  { field: 'summary', headerName: '擷取大意', width: 130 },
  { field: 'embed', headerName: '向量化', width: 130 },
  { field: 'vdb', headerName: '加入向量資料庫', width: 130 },
  { field: 'status', headerName: '狀態', width: 130 },
  { field: 'size', headerName: '檔案大小', width: 130 },  
  { field: 'link', headerName: '連結', width: 130 },  
];

interface Data {
  name: string;
  id: string;
  size: number | null;
  link: string;
  doc: Doc;
  statusPdf: string;
  statusText: string; //'Done'|'Pending'|'Undone';
  statusSummary: string; //'Done'|'Pending'|'Undone';
  statusEmbed: string; //'Done'|'Pending'|'Undone';
  statusVdb: string; //'Done'|'Pending'|'Undone';
}

function createRow(doc: Doc): Data {
  const _size = doc.size ? doc.size : null;
  return {
    name: doc.name,
    id: doc.id,
    size: _size,
    doc: doc,
    link: doc.url!,
    statusPdf: doc.statusPdf ?? "Undone",
    statusText: doc.statusText ?? "Undone",
    statusSummary: doc.statusSummary ?? "Undone",
    statusEmbed: doc.statusEmbed ?? "Undone",
    statusVdb: doc.statusVdb ?? "Undone",
  };
}

interface StickyHeadTableProps {
  Docs: Doc[];
  setNewPath: React.Dispatch<React.SetStateAction<string>>;
}
const DataGridTable: React.FC<StickyHeadTableProps> = ({
  Docs: docs,
  setNewPath: setPath,
})=>{
  const rows = docs.map(doc=>{return createRow(doc);})
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
      />
    </div>
  );
}

export default DataGridTable;