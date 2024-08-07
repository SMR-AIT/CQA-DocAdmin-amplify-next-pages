import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { Schema } from '@/amplify/data/resource';
import { generateClient } from 'aws-amplify/api';
import { toLocalISOString } from './DatetimeTool';
import PrimarySearchAppBar from './SearchBar';
import { get_log } from '@/lib/LogOps';

type log = Schema['log']['type']

const client = generateClient<Schema>({
  authMode: "apiKey",
});

interface column {
  id: number,
  datetime: string,
  username: string,
  action: string,
  object: string
}

interface LogContextType {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  logs: log[];
  setLogs: React.Dispatch<React.SetStateAction<log[]>>;
  rows: column[];
  setRows: React.Dispatch<React.SetStateAction<column[]>>;
}

const LogContext = React.createContext<LogContextType | undefined>(undefined);

export const useLogContext = () => {
  const context = React.useContext(LogContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};


const isoDateComparator = (v1: string, v2: string) => {
  const date1 = new Date(v1);
  const date2 = new Date(v2);

  return date1.getTime() - date2.getTime(); // Sorting in ascending order
};

export function create_row(id: number, log: log): column {
  if (log.createdAt == undefined) console.log('undefined log created time', log)
  const local_time = toLocalISOString(log.createdAt!);

  return {
    id: id,
    datetime: local_time,
    username: log.name,
    action: log.action!,
    object: log.object!
  }
}

export default function LogDataGrid() {
  const [logs, setLogs] = React.useState<Array<log>>([]);
  const [filterLogs, setFilterLogs] = React.useState<Array<log>>([]);
  const [rows, setRows] = React.useState<Array<column>>([]);
  const [search, setSearch] = React.useState<string>('');
  let is_locked_logs = false;

  React.useEffect(() => {
    const sub = client.models.log.observeQuery().subscribe({
      next: async ({ items, isSynced }) => {
        if (is_locked_logs && isSynced)return console.log('log observe query -> is locked');

        console.log('items', items)
        const logsWithoutNull = items.filter(log => (log.createdAt != null && log.createdAt != undefined));
        setLogs(logsWithoutNull);
        console.log('logsWithoutNull', logsWithoutNull)
        is_locked_logs = true;
      },
      error: (err) => console.error("Error fetching logs:", err),
    });

    const sub_create = client.models.log.onCreate({ selectionSet: ['id'] }).subscribe({
      next: async(data) => {
        console.log('onCreate data', data);
        if (data.id == undefined) {
          console.log('data.id == undefined  return');
          return;
        }
        if (logs.findIndex(log => log.id == data.id) == -1) {
          console.log('does not exist in the logs yet')
          const newLog = await get_log({ id: data.id });
          if (newLog){
            setLogs((prevLogs) => [...prevLogs, newLog!]);
          }else{
            console.log('newLog is null')
          }
        } else {
          console.log('exist in the logs already')
        }
      },
      error: (err) => console.error("Error fetching created logs", err)
    })
    return () => {
      sub.unsubscribe();
      sub_create.unsubscribe();
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


  React.useEffect(
    () => {
      const fetchData = async () => {
        try {
          setFilterLogs(logs)
        } catch (error) {
          console.log("Error fetching logs:", error);
        }
      };
      fetchData();
    },
    [logs]
  )

  React.useEffect(
    () => {
      setRows(filterLogs.map((log, log_id) => create_row(log_id, log)));
    },
    [filterLogs]
  )

  const initialSortModel: GridSortModel = [
    {
      field: 'datetime', // Column to sort by default
      sort: 'desc', // 'asc' for ascending or '' for descending
    },
  ];

  return (
    <LogContext.Provider
      value={{ search, setSearch, logs, setLogs, rows, setRows }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: "column",
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '90vw',
        height: '83.5vh',
        marginTop: '12vh', marginBottom: '0.75vh'
      }}>
        <PrimarySearchAppBar />
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 15,
              },
            },
            sorting: {
              sortModel: initialSortModel,
            }
          }}
          pageSizeOptions={[15]}
          checkboxSelection
          disableRowSelectionOnClick
          rowHeight={30}
        />
      </Box>

    </LogContext.Provider>
  );
}