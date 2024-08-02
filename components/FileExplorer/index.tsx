import { generateClient } from "aws-amplify/api";
import React, { useEffect, useState, createContext, useContext } from "react";
import type { Schema } from "@/amplify/data/resource";
import {
  type WithAuthenticatorProps,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import "@aws-amplify/ui-react/styles.css";
import StickyHeadTable from "./fileTable/FileTable";
import * as fileOps from "@/lib/FileOps";
import { Box, Typography } from "@mui/material";
import { triggerBuildVdb } from "@/lib/BuildVDB";
import EnhancedTable from "./fileTable/FileTableSort";

Amplify.configure(outputs);

// Generating the client
const client = generateClient<Schema>({
  authMode: "apiKey",
});
type Doc = Schema["Doc"]["type"];

// Define the shape of the context
interface AppContextType {
  path: string;
  setPath: React.Dispatch<React.SetStateAction<string>>;
  allDocs: Doc[];
  setAllDocs: React.Dispatch<React.SetStateAction<Doc[]>>;
  currentDocs: Doc[];
  setCurrentDocs: React.Dispatch<React.SetStateAction<Doc[]>>;
  modified: boolean;
  setModified: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with a default value (could be empty or `undefined`)
const AppContext = createContext<AppContextType | undefined>(undefined);

function App({ signOut, user }: WithAuthenticatorProps) {
  const [path, setPath] = useState<string>("");
  const [allDocs, setAllDocs] = useState<Array<Schema["Doc"]["type"]>>([]);
  const [currentDocs, setCurrentDocs] = useState<Doc[]>([]);
  const [modified, setModified] = useState<boolean>(false);

  // set '更新部署' to true if there is any status == undone
  useEffect(() => {
    const fieldsToCheck: (keyof Doc)[] = ['statusText', 'statusSummary', 'statusEmbed', 'statusVdb', 'statusPdf'];

    const allFieldsDone = fieldsToCheck.every(field =>
      allDocs.every(doc => (doc[field] != 'Undone' && doc.type != 'folder') || (doc.type == 'folder'))
    );
    allDocs.map((doc, doc_index) => {
      const doc_fields_done = fieldsToCheck.every(field =>
        doc[field] == 'Done'
      )
      if (doc_fields_done) { doc.status = 'Done'; }
      fieldsToCheck.map((field, index) => {
        if (!((doc[field] != 'Undone' && doc.type != 'folder') || (doc.type == 'folder'))) {
          console.log(doc, 'file not done')
        } else { console.log('file done') }
      }
      )
    })
    setModified(!allFieldsDone);
    // setModified(true)
  }, [allDocs]);

  // subscribe to the doc data
  useEffect(() => {
    const sub = client.models.Doc.observeQuery().subscribe({
      next: (data) => {setAllDocs([...data.items]); console.log('index allDocs: ', allDocs)},
      error: (err) => console.error("Error fetching documents:", err),
    });
    return () => {
      sub.unsubscribe();
    };
  }, []);

  // update the file explorer view everytime there is an update.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: docs } = await client.models.Doc.list({
          filter: {
            path: {
              eq: path,
            },
          },
        });
        const folders = docs.filter((doc) => doc.type == 'folder' && doc.path == path).sort();
        const docs_rest = docs.filter((doc) => doc.type != 'folder' && doc.path == path).sort();
        setCurrentDocs([...folders, ...docs_rest]);
        console.log("current docs updated: ", currentDocs)
      } catch (error) {
        console.log("Error fetching docs:", error);
      }
    };
    fetchData();
  }, [path, allDocs]);

  const hasID = (idToCheck: string) => { return allDocs.some(doc => doc.id === idToCheck) }


  return (
    <AppContext.Provider
      value={{ path, setPath, allDocs, setAllDocs, currentDocs, setCurrentDocs, modified, setModified }}
    >

      <main className="app-container">
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          marginTop: '12vh', marginBottom: '0.75vh'
        }}>
          <Typography variant='h5' >user:{user?.username}</Typography>
          <ButtonGroup
            variant="contained"
            aria-label="Basic button group"
            size="small"
            sx={{ marginBottom: '1vh' }}
          >
            <Button
              variant="contained"
              component="label"
              color="success"
              sx={{ AlignHorizontalRight: "false" }}
            >
              上傳檔案
              <input
                type="file"
                accept=".pdf,.doc,.docx,.odt,image/*"
                onChange={(e) =>
                  fileOps.createMultipleDocs(
                    path,
                    e.target.files!,
                    user?.username!,
                    hasID
                  )
                }
                style={{ display: "none" }}
                multiple
              />
            </Button>
            <Button
              className="create-folder"
              onClick={() => {
                fileOps.createFolder(path, hasID);
              }}
              color="success"
            >
              建新資料夾
            </Button>
            <Button
              className="file-input"
              onClick={() => {
                fileOps.goUpLayer(path, setPath);
              }}
              color="primary"
              disabled={path === ''}
            >
              回上一層
            </Button>

            <Button
              onClick={() => { fileOps.setUndone2Pending(allDocs); triggerBuildVdb(); }} color="warning"
              disabled={!modified}
            >
              更新部署
            </Button>
            {/* <Button onClick={() => fileOps.refreshStatus(allDocs)} color="warning">
              重新整理
            </Button> */}
          </ButtonGroup>
        </Box>
        <EnhancedTable></EnhancedTable>
      </main>
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export default withAuthenticator(App);
