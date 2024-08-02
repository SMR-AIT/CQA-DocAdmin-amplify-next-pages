import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { Schema } from '@/amplify/data/resource';
import { generateClient } from 'aws-amplify/api';
import { toLocalISOString } from './DatetimeTool';
// import { customDateComparator } from './DatetimeTool';
type log = Schema['log']['type']
const client = generateClient<Schema>({
  authMode: "apiKey",
});

// const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// const rows = [
//   { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },
//   { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31 },
//   { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31 },
//   { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
//   { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
//   { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
//   { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
//   { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
//   { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
// ];

const isoDateComparator = (v1: string, v2: string) => {
  const date1 = new Date(v1);
  const date2 = new Date(v2);

  return date1.getTime() - date2.getTime(); // Sorting in ascending order
};

export default function LogDataGrid() {
  const [logs, setLogs] = React.useState<Array<log>>([]);
  const [rows, setRows] = React.useState<Array<column>>([]);
  React.useEffect(
    () => {
      const sub = client.models.log.observeQuery().subscribe({
        next: (data) => { setLogs([...data.items]); console.log('logs: ', logs) },
        error: (err) => console.error("Error fetching logs:", err),
      });
      return () => {
        sub.unsubscribe();
      };
    },
    []
  )

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: 'datetime',
      headerName: '時間(ISO)',
      width: 250,
      sortComparator: isoDateComparator,
    },
    {
      field: 'username',
      headerName: '使用者',
      width: 150,
    },
    {
      field: 'action',
      headerName: '動作',
      width: 150,
    },
    {
      field: 'object',
      headerName: '對象',
      width: 500,
    },
  ];

  interface column {
    id: number,
    datetime: string,
    username: string,
    action: string,
    object: string
  }

  function create_row(id: number, log: log): column {
    const date = new Date(log.createdAt); // Parse ISO datetime to Date object
    const local_time = toLocalISOString(log.createdAt);
    
    return {
      id: id,
      datetime: local_time,
      username: log.name,
      action: log.action!,
      object: log.object!
    }
  }
  React.useEffect(
    () => { setRows(logs.map((log, log_id) => create_row(log_id, log))) },
    [logs]
  )

  const initialSortModel: GridSortModel = [
    {
      field: 'datetime', // Column to sort by default
      sort: 'desc', // 'asc' for ascending or '' for descending
    },
  ];

  return (
    // <Box sx={{ height: 400, width: '100%' }}>
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '90vw',
      height: '80vh',
      marginTop: '15vh', marginBottom: '0.5vh'
    }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 15,
            },
          },
        }}
        pageSizeOptions={[15]}
        checkboxSelection
        disableRowSelectionOnClick
        sortModel={initialSortModel}
        rowHeight={30}
      />
    </Box>
  );
}