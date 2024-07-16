import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import type { Schema } from "@/amplify/data/resource";
import getIcon from "@/lib/GetIcon";
import Button from "@mui/material/Button";
import * as fileOps from "@/lib/FileOps";
import ButtonGroup from "@mui/material/ButtonGroup";

type Doc = Schema["Doc"]["type"];

interface Column {
  id: "name" | "size" | "button" | "link";
  label: string;
  minWidth?: number;
  align?: "right" | "justify" | "center" | "left" | "inherit" | undefined;
  format?: (value: any) => string;
}

const columns: readonly Column[] = [
  { id: "name", label: "Name", minWidth: 170 },
  {
    id: "size",
    label: "Size",
    minWidth: 100,
    align: "right",
    format: (value: number) =>
      Math.floor(value / 1000).toLocaleString("en-US") + " KB",
  },
  {
    id: "button",
    label: "",
    minWidth: 100,
    align: "justify",
    format: (value: number) => value.toLocaleString("en-US"),
  },
];

interface Data {
  name: string;
  id: string;
  size: number | null;
  action: "delete";
  link: string;
  doc: Doc;
}

function createData(doc: Doc): Data {
  const _size = doc.size ? doc.size : null;
  return {
    name: doc.name,
    id: doc.id,
    size: _size,
    action: "delete",
    doc: doc,
    link: doc.url!,
  };
}

interface StickyHeadTableProps {
  Docs: Doc[];
  setNewPath: React.Dispatch<React.SetStateAction<string>>;
}

const StickyHeadTable: React.FC<StickyHeadTableProps> = ({
  Docs: docs,
  setNewPath: setPath,
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const rows = docs.map((doc) => {
    return createData(doc);
  });

  return (
    <Paper sx={{ width: "90vw", height: "75vh", overflow: "hidden" }}>
      {/* <TableContainer sx={{ maxHeight: 440 }}> */}
      <TableContainer component={Paper} sx={{ flexGrow: 1, height: "75vh" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      if (column.id === "button") {
                        return (
                          <TableCell key={column.id} align={column.align}>
                            <ButtonGroup
                              variant="contained"
                              aria-label="Basic button group"
                              size="small"
                            >
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() => fileOps.deleteDoc(row.doc)}
                              >
                                刪除
                              </Button>
                              <Button
                                variant="contained"
                                href={row.doc.url!}
                                target={
                                  row.doc.type === "folder"
                                    ? undefined
                                    : "_blank"
                                }
                                onClick={() => {
                                  if (row.doc.type == "folder") {
                                    setPath(row.doc.path! + row.doc.name);
                                  }
                                }}
                              >
                                連結
                              </Button>
                            </ButtonGroup>
                          </TableCell>
                        );
                      } else if (column.id === "name") {
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {getIcon(row.doc.type?.toString()!)} {row.doc.name}{" "}
                          </TableCell>
                        );
                      } else {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === "number"
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      }
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default StickyHeadTable;
