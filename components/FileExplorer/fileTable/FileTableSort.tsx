import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import type { Schema } from "@/amplify/data/resource";
import { createTheme, Link, ThemeProvider } from '@mui/material';
import * as fileOps from "@/lib/FileOps";
import { useAppContext } from "..";
import { Flex } from '@aws-amplify/ui-react';
import { status2chip } from './Status2Chip';
import { User } from 'aws-cdk-lib/aws-iam';
import { create_log } from '@/lib/LogOps';



type Doc = Schema["Doc"]["type"];


const theme = createTheme({
  components: {
    MuiTablePagination: {
      styleOverrides: {
        selectIcon: {
          color: 'white', // Change the dropdown icon color to white
        },
        select: {
          color: 'white', // Change the dropdown text color to white
          backgroundColor: 'blue', // Change the dropdown background color to blue
          '&:focus': {
            backgroundColor: 'blue', // Ensure background color remains blue on focus
          },
        },
        menuItem: {
          backgroundColor: 'white', // Change the background color of menu items to blue
          color: 'black', // Change the text color of menu items to white
          '&:hover': {
            backgroundColor: 'white', // Change the background color on hover
            color: 'blue', // Change the text color on hover
          },
        },
      },
    },
  },
});

interface Data {
  id: string,
  name: string;
  nametip: string;
  size: number;
  pdf: string;
  text: string;
  summary: string;
  embedding: string;
  vdb: string;
  status: string;
  type: string;
  url: string;
}

const statusMapping: { [key: string]: string } = {
  'Done': '完成',
  'Undone': '未完成',
  'Pending': '執行中',
  '-': '-'
};

// Function to map status
const mapStatus = (status: string): string => {
  return statusMapping[status] || 'Unknown status';
};

function createData(doc: Doc): Data {
  const shown_name = doc.name;//.length > 20 ? doc.name.slice(0, 17) + '...' : doc.name;
  const tooltip = doc.name.length > 20 ? doc.name : '';
  console.log('createData: ', doc);
  return {
    id: doc.id,
    name: shown_name,
    nametip: tooltip,
    size: doc.size ? Math.round(doc.size / 1000) : 0,
    pdf: doc.statusPdf ? mapStatus(doc.statusPdf!) : '',
    text: doc.statusText ? mapStatus(doc.statusText!) : '',
    summary: doc.statusSummary ? mapStatus(doc.statusSummary!) : '',
    embedding: doc.statusEmbed ? mapStatus(doc.statusEmbed!) : '',
    vdb: doc.statusVdb ? mapStatus(doc.statusVdb!) : '',
    status: doc.status ? mapStatus(doc.status!) : '',
    type: doc.type ?? '',
    url: doc.url ?? ''
  };
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: '檔案名稱',
  },
  {
    id: 'size',
    numeric: true,
    disablePadding: false,
    label: '檔案大小(KB)',
  },
  {
    id: 'status',
    numeric: true,
    disablePadding: false,
    label: '狀態',
  },
  {
    id: 'pdf',
    numeric: true,
    disablePadding: false,
    label: '轉出pdf檔',
  },
  {
    id: 'text',
    numeric: true,
    disablePadding: false,
    label: '擷取文字',
  },
  {
    id: 'summary',
    numeric: true,
    disablePadding: false,
    label: '擷取大意',
  },
  {
    id: 'embedding',
    numeric: true,
    disablePadding: false,
    label: '向量化',
  },
  {
    id: 'vdb',
    numeric: true,
    disablePadding: false,
    label: '加入向量資料庫',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  selected: readonly string[];
  setSelected: React.Dispatch<React.SetStateAction<readonly string[]>>;
  username: string
}

const cell_styles = {
  cell: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '20vw' // Adjust this width as needed
  }
};

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { path } = useAppContext();
  const { username, selected, setSelected } = props;
  const numSelected = selected.length;
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          已選取 {numSelected} 個檔案
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          資料夾: ./{path}
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={() => {
            create_log({name:username, action:'刪除檔案', object:selected.join(', ')});
            selected.map((id) => {
              fileOps.deleteDocFile(id);
              setSelected([])
            })
          }}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}


interface StickyHeadSortTableProps {
}
const EnhancedTable: React.FC<StickyHeadSortTableProps> = ({ }) => {
  const {username, path, setPath, allDocs, setAllDocs, currentDocs, setCurrentDocs, modified, setModified } = useAppContext();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('status');
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [lastSelected, setLastSelected] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(true);
  const [rows, setRows] = React.useState<Data[]>([]);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [visibleRows, setVisibleRows] = React.useState<Data[]>([]);


  React.useEffect(() => {
    setSelected([])
  }, [path]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setLastSelected(null);
  };

  // const rows = React.useMemo(()=>currentDocs.map(doc => { return createData(doc); }), [currentDocs]);
  React.useEffect(
    () => {
      const tempRows = currentDocs.map(doc => { return createData(doc); })
      setRows(stableSort(tempRows, getComparator(order, orderBy)));
    },
    [order, orderBy, currentDocs],
  );

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const addItemsWithoutOverlap = (existingItems: readonly string[], itemsToAdd: string[]): string[] => {
    const filteredItemsToAdd = itemsToAdd.filter(item => !existingItems.includes(item));
    return existingItems.concat(filteredItemsToAdd);
  };

  const createRange = (start: number, end: number, step: number = 1): number[] => {
    if (end < start) {
      console.log('haha')
      console.log('start', start, 'end', end)
      return Array.from({ length: Math.ceil((start - end + 1) / step) }, (_, i) => end + i * step);
    }
    console.log('start', start, 'end', end)
    return Array.from({ length: Math.ceil((end - start + 1) / step) }, (_, i) => start + i * step);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    console.log(event);
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      // Not found: add to the list
      const selectedIndex = rows.findIndex((row) => row.id == id)
      if (lastSelected != null && event.shiftKey) {
        const indexes: number[] = createRange(lastSelected, selectedIndex);
        const ids = indexes.map(index => rows[index].id);
        newSelected = addItemsWithoutOverlap(selected, ids);
      } else {
        newSelected = newSelected.concat(selected, id);
      }
      setLastSelected(selectedIndex);
    } else { // remove from the list
      setLastSelected(null);
      if (selectedIndex === 0) { // Remove the first item
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) { // Remove the last item
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) { // Remove the middle item
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1),
        );
      }
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  React.useEffect(
    () => {
      setVisibleRows(rows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ));
      console.log('update visible rows')
      console.log('Docs', allDocs)
    },
    [rows]
  )

  return (
    <ThemeProvider theme={theme}>

      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <EnhancedTableToolbar selected={selected} setSelected={setSelected} username={username}/>
          <TableContainer sx={{ flexGrow: 1, height: "55vh", width: '90vw' }}>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size={dense ? 'small' : 'medium'}
              stickyHeader aria-label="sticky table"
            >
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
              />
              <TableBody>
                {visibleRows.map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                        style={cell_styles.cell}
                      >
                        <Tooltip title={row.nametip}>
                          <Link
                            href={row.url!}
                            target={
                              row.type === "folder"
                                ? undefined
                                : "_blank"
                            }
                            onClick={() => {
                              if (row.type == "folder") {
                                setPath(row.id!);
                              }
                            }}
                            underline="none">
                            <Typography variant="body1">
                              {row.name}
                            </Typography>
                          </Link>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">{row.size}</TableCell>
                      <TableCell align="right">{status2chip(row.status)}</TableCell>
                      <TableCell align="right">{status2chip(row.pdf)}</TableCell>
                      <TableCell align="right">{status2chip(row.text)}</TableCell>
                      <TableCell align="right">{status2chip(row.summary)}</TableCell>
                      <TableCell align="right">{status2chip(row.embedding)}</TableCell>
                      <TableCell align="right">{status2chip(row.vdb)}</TableCell>
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: (dense ? 33 : 53) * emptyRows,
                    }}
                  >
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            padding={2}>
            <FormControlLabel
              control={<Switch checked={dense} onChange={handleChangeDense} />}
              label="Dense padding"
            />
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 100]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </Paper>

      </Box>
    </ThemeProvider>
  );
}

export default EnhancedTable;