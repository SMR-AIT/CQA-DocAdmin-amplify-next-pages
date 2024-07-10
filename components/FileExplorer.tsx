import { generateClient } from "aws-amplify/api";
import React, { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import {
  type WithAuthenticatorProps,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
// import { Button } from "@aws-amplify/ui-react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import "@aws-amplify/ui-react/styles.css";
import StickyHeadTable from "./FileTable";
import * as fileOps from "./FileOps";
import { AlignHorizontalRight } from "@mui/icons-material";

Amplify.configure(outputs);
const root = "Doc/";

// Generating the client
const client = generateClient<Schema>({
  authMode: "apiKey",
});

type Doc = Schema["Doc"]["type"];

function App({ signOut, user }: WithAuthenticatorProps) {
  // State to hold the recognized text
  // const [currentDoc, setCurrentDoc] = useState<Doc | null>(null);

  const [path, setPath] = useState<string>("");
  const [allDocs, setAllDocs] = useState<Doc[]>([]);
  const [currentDocs, setCurrentDocs] = useState<Doc[]>([]);

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
        const folders = docs.filter((doc) => doc.name.endsWith("/")).sort();
        console.log("folders:", folders);
        const docs_rest = docs.filter((doc) => !doc.name.endsWith("/")).sort();
        console.log("docs_rest:", docs_rest);
        setCurrentDocs([...folders, ...docs_rest]);
      } catch (error) {
        console.log("Error fetching docs:", error);
      }
    };

    fetchData();
  }, [path, allDocs]);

  return (
    <main className="app-container">
      {/* <h1 className="greeting">Hello {user?.username}!</h1> */}
      <h2 className="current-folder">Current Doc: {"/" + path}</h2>

      <div className="file-upload-container">
        {/* 選取要上傳到此位置的檔案: */}
        {/* <input
            type="file"
            accept=".pdf,.doc,.docx,.odt,image/*"
            onChange={(e) =>
              fileOps.createMultipleDocs(path, e.target.files!, user?.username!)
            }
            className="file-input"
            multiple
          /> */}
        <ButtonGroup
          variant="contained"
          aria-label="Basic button group"
          size="small"
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
                  user?.username!
                )
              }
              style={{ display: "none" }}
              multiple
            />
          </Button>

          <Button
            className="file-input"
            onClick={() => {
              fileOps.goUpLayer(path, setPath);
            }}
            size="small"
            color="secondary"
          >
            回上一層
          </Button>
          <Button
            className="create-folder"
            onClick={() => {
              fileOps.createFolder(path);
            }}
            size="small"
          >
            建新資料夾
          </Button>
        </ButtonGroup>
      </div>
      <StickyHeadTable
        Docs={currentDocs}
        setNewPath={setPath}
      ></StickyHeadTable>
    </main>
  );
}

export default withAuthenticator(App);
