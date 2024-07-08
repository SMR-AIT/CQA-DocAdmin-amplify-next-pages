import { generateClient } from "aws-amplify/api";
import { uploadData, getUrl, remove } from "aws-amplify/storage";
import React, { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";
import {
  type WithAuthenticatorProps,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import getValidFolderName from "./GetFolderName";


Amplify.configure(outputs);

// Generating the client
const client = generateClient<Schema>({
  authMode: "apiKey",
});

type Doc = Schema["Doc"]["type"];

function App({ signOut, user }: WithAuthenticatorProps) {
  // State to hold the recognized text
  // const [currentDoc, setCurrentDoc] = useState<Doc | null>(null);

  const [path, setPath] = useState<string>("/testing/");
  const [selectedIDs, setSelectedIDs] = useState<string[]>([]);
  const [currentDocs, setCurrentDocs] = useState<Doc[]>([]);

  // update docs when the path is changed
  useEffect(() => {
    const fetchData = async () => {
      const { data: docs_all } = await client.models.Doc.list();
      console.log('docs_all', docs_all);
      const { data: docs } = await client.models.Doc.list({
        filter: { path: { eq: path } },
      });
      console.log('useEffect fetchData: ', docs)
      console.log('path: ', path)
      setCurrentDocs(docs);
    };

    fetchData();
  }, [path])

  // go up one layer
  function goUpLayer() {
    
    if (!path.endsWith('/')) {console.log('Current path does not end with "/": ' + path);}
    const newPath = path.split('/').slice(0, -2).join('/') + '/';
    console.log('newPath: ', newPath);
    setPath(newPath);
  }

  async function createMultipleDocs(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    try {
      // Create docs data and Upload all files to Storage:
      await Promise.all(
        Array.from(e.target.files).map(async (file) => {

          // upload doc file to storage
          const response_upload = await uploadData({
            path: `Doc/${path}${file.name}`,
            data: file,
            options: {
              contentType: file.type, // contentType is optional
            },
          });
          const result = response_upload.result;
          console.log(result);

          // Create the API record:
          const response_create = await client.models.Doc.create({
            name: file.name,
            owner: user?.username,
            size: file.size,
            type: file.type,
            // lastModified: file.lastModified.toString(),
            path: path,
            url: (await getUrl({ path: 'Doc/${path}${file.name}' })).url.toString(),
          });
          console.log("response (create doc): ", response_create);

          return;
        })
      );
    } catch (error) {
      console.error("Error create Doc / file:", error);
    }
  }

  async function deleteDoc(id: string) {

    try {

      // get the doc info
      const { data: docDelete } = await client.models.Doc.get({ id });
      const docPath = docDelete?.path!;
      const docName = docDelete?.name!;
      if (!docPath) {
        console.log("Failed to delete folder, docPath not found.");
        return;
      }

      // remove doc file in storage
      const response_remove = await remove({
        path: `Doc/${docPath}${docName}`,
      });
      console.log("response (remove s3 obj): ", response_remove);

      // delete the data
      const response_delete = await client.models.Doc.delete({
        id: id,
      });
      console.log("response (delete doc): ", response_delete);

    } catch (error) {
      console.error("Error delete Doc / file:", error);
    }
  }

  async function createFolder(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      // Create docs data and Upload all files to Storage:
      // Create the API record:
      const folderName = getValidFolderName();
      if (folderName !== null) {
        const response_create = await client.models.Doc.create({
          name: folderName,
          path: path,
        });
        console.log("response (create folder): ", response_create);
      } else {
        console.log("User canceled the input.");
      }
      return;
    } catch (error) {
      console.error("Error create Doc / file:", error);
    }
  }

  async function deleteFolder(id: string) {
    try {
      // get the folder to delete
      const { data: folder } = await client.models.Doc.get({ id });
      const folderPath = folder?.path!;
      if (!folderPath) {
        console.log("Fail to delete folder, folderPath not found.");
        return;
      }

      // get the docs in the folder
      const { data: docs } = await client.models.Doc.list({
        filter: {
          path: {
            beginsWith: folder!.path ? folder!.path : "",
          },
        },
      });
      if (docs.length == 0) {
        console.log();
        throw new Error(
          "No doc data found to delete. Should at least have one doc data (the folder itself)."
        );
      }

      await Promise.all(
        Array.from(docs).map(async (file) => {
          // delete all data in that folder
          const response_delete = await client.models.Doc.delete({
            id: file.id,
          });
          console.log("response (delete doc): ", response_delete);

          // remove doc file in storage
          const response_remove = await remove({
            path: `Doc/${file.path}${file.name}`,
          });
          console.log("response (remove s3 obj): ", response_remove);

          return;
        })
      );
    } catch (error) {
      console.error("Error remove Doc / file:", error);
    }
  }


  return (
    <main className="app-container">
      <h1 className="greeting">Hello {user?.username}!</h1>
      <h2 className="current-folder">Current Doc: {'/' + path}</h2>

      <div className="file-upload-container">
        <label className="file-input-label">
          Upload file(s):
          <input
            type="file"
            accept="image/*"
            onChange={createMultipleDocs}
            className="file-input"
            multiple
          />
        </label>

        <label className="file-input-label">
          <button
            className="file-input"
            onClick={() => { goUpLayer }}
          >Go to upper layer</button>
        </label>
      </div>

      <div className="folder-content-container">
        <ul>
          {currentDocs.map((doc) => (
            <li key={doc.id}>
              {doc.name}{" "}
              <button onClick={() => deleteDoc(doc.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

    </main>
  );
}

export default withAuthenticator(App);
