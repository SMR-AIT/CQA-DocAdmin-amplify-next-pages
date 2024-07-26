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
import { updateDocStatus } from "@/lib/UpdateDocData";

Amplify.configure(outputs);

// Generating the client
const client = generateClient<Schema>({
  authMode: "apiKey",
});
// client.queries.buildVDB({name:''})
type Doc = Schema["Doc"]["type"];

// Define the shape of the context state
interface StateContextProps {
  modified: boolean;
  setModified: React.Dispatch<React.SetStateAction<boolean>>;
}
const StateContext = createContext<StateContextProps | undefined>(undefined);

function App({ signOut, user }: WithAuthenticatorProps) {
  const [path, setPath] = useState<string>("");
  const [allDocs, setAllDocs] = useState<Doc[]>([]);
  const [currentDocs, setCurrentDocs] = useState<Doc[]>([]);
  const [modified, setModified] = useState<boolean>(false);

  useEffect(() => {
    const fieldsToCheck: (keyof Doc)[] = ['statusText', 'statusSummary', 'statusEmbed', 'statusVdb', 'statusPdf'];

    const allFieldsDone = fieldsToCheck.every(field =>
      allDocs.every(doc => (doc[field] === 'Done' && doc.type != 'folder') || doc.type == 'folder')
    );

    setModified(!allFieldsDone);
  }, []);

  // subscribe to the doc data
  useEffect(() => {
    const sub = client.models.Doc.observeQuery().subscribe({
      next: (data) => setAllDocs([...data.items]),
      error: (err) => console.error("Error fetching documents:", err),
    });
    return () => {
      sub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: docs } = await client.models.Doc.list({
          filter: { path: { eq: path } },
        });
        console.log("useEffect fetchData: ", docs);
        console.log("path: ", path);
        const folders = docs.filter((doc) => doc.type == 'folder').sort();
        console.log("folders:", folders);
        const docs_rest = docs.filter((doc) => doc.type != 'folder').sort();
        console.log("docs_rest:", docs_rest);
        setCurrentDocs([...folders, ...docs_rest]);
      } catch (error) {
        console.log("Error fetching docs:", error);
      }
    };

    fetchData();
  }, [path, allDocs]);

  const hasID = (idToCheck: string) => { return allDocs.some(doc => doc.id === idToCheck) }


  return (
    <StateContext.Provider value={{ modified, setModified }}>
      <main className="app-container">
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          marginTop: '12vh', marginBottom: '0.75vh'
        }}>
          <Typography variant='h5' >資料夾: ./{path}</Typography>
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
              onClick={() => { triggerBuildVdb(); setModified(false); }} color="warning"
              disabled={!modified}
            >
              更新部署
            </Button>
            <Button onClick={() => updateDocStatus()} color="warning">
              重新整理
            </Button>
          </ButtonGroup>
        </Box>
        <StickyHeadTable
          Docs={currentDocs}
          setNewPath={setPath}
        ></StickyHeadTable>
      </main>
    </StateContext.Provider>
  );
}

// Custom hook to use the context
export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
      throw new Error('useStateContext must be used within a StateProvider');
  }
  return context;
};

export default withAuthenticator(App);
