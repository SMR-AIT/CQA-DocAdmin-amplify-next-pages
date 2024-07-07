import "./App.css";
import { generateClient } from "aws-amplify/api";
import { uploadData, getUrl, remove } from "aws-amplify/storage";
import React, { useState } from "react";
import type { Schema } from "../amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";
import {
  type WithAuthenticatorProps,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

// Generating the client
const client = generateClient<Schema>({
  authMode: "apiKey",
});

type Doc = Schema["Doc"]["type"];

function App({ signOut, user }: WithAuthenticatorProps) {
  // State to hold the recognized text
  const [currentDoc, setCurrentDoc] = useState<Doc | null>(null);
  const [path, setPath] = useState<string>("");
  const [selectedIDs, setSelectedIDs] = useState<string[]>([]);

  // Used to display images for current Doc (folder):
  const [currentDocs, setCurrentDocs] = useState<
    (string | null | undefined)[] | null | undefined
  >([]);

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
            lastModified: Math.floor(file.lastModified / 1000).toString(),
            path: path,
            url:(await getUrl({ path: 'Doc/${path}${file.name}' })).url.toString(),
          });
          console.log("response (create doc): ", response_create);

          return;
        })
      );
    } catch (error) {
      console.error("Error create Doc / file:", error);
    }
  }

  async function deleteDoc(id:string) {

    try {

      // get the doc info
      const { data: docDelete } = await client.models.Doc.get({ id });
      const docPath = docDelete?.path!;
      const docName = docDelete?.name!;
      if (!docPath) {
        console.log("Fail to delete folder, docPath not found.");
        return;
      }

      // delete the data
      const response_delete = await client.models.Doc.delete({
        id: id,
      });
      console.log("response (delete doc): ", response_delete);

      // remove doc file in storage
      const response_remove = await remove({
        path: `Doc/${docPath}${docName}`,
      });
      console.log("response (remove s3 obj): ", response_remove);

      );
    } catch (error) {
      console.error("Error delete Doc / file:", error);
    }
  }

  async function createFolder(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      // Create docs data and Upload all files to Storage:
      // Create the API record:
      const response_create = await client.models.Doc.create({
        name: window.prompt("Folder name")!,
        path: path,
      });
      console.log("response (create folder): ", response_create);
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
      <h2 className="current-album">Current Doc: {currentDoc?.id}</h2>

      <div className="file-input-container">
        <label className="file-input-label">
          Create Doc with one file:
          <input
            type="file"
            accept="image/*"
            onChange={createDocWithFirstDoc}
            className="file-input"
          />
        </label>

        <label className="file-input-label">
          Create Doc with multiple files:
          <input
            type="file"
            accept="image/*"
            onChange={createMultipleDocs}
            multiple
            className="file-input"
          />
        </label>

        <label className="file-input-label">
          Add multiple images to current Doc:
          <input
            type="file"
            accept="image/*"
            onChange={addNewImagesToDoc}
            disabled={!currentDoc}
            multiple
            className="file-input"
          />
        </label>

        <label className="file-input-label">
          Replace last image:
          <input
            type="file"
            accept="image/*"
            onChange={updateLastImage}
            disabled={!currentDoc || !currentDocs}
            className="file-input"
          />
        </label>
      </div>

      <div className="button-container">
        <button
          onClick={getImagesForDoc}
          disabled={!currentDoc || !currentDocs}
          className="app-button"
        >
          Get Images for Current Photo Album
        </button>
        <button
          onClick={removeImagesFromDoc}
          disabled={!currentDoc || !currentDocs}
          className="app-button"
        >
          Remove images from current Doc (does not delete images)
        </button>
        <button
          onClick={deleteImagesForCurrentDoc}
          disabled={!currentDoc || !currentDocs}
          className="app-button"
        >
          Remove images from current Doc, then delete images
        </button>
        <button
          onClick={deleteCurrentDocAndImages}
          disabled={!currentDoc}
          className="app-button"
        >
          Delete current Doc (and images, if they exist)
        </button>
        <button onClick={signOut} className="app-button">
          Sign out
        </button>
      </div>

      <div className="image-container">
        {currentDocs &&
          currentDocs.map((url, idx) => {
            if (!url) return undefined;
            return (
              <img src={url} key={idx} alt="Storage file" className="image" />
            );
          })}
      </div>
    </main>
  );
}

export default withAuthenticator(App);
