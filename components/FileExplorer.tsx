import { generateClient } from "aws-amplify/api";
import { uploadData, remove } from "aws-amplify/storage";
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
import Link from 'next/link';


Amplify.configure(outputs);
const root = 'Doc/'

// Generating the client
const client = generateClient<Schema>({
  authMode: "apiKey",
});

type Doc = Schema["Doc"]["type"];

function App({ signOut, user }: WithAuthenticatorProps) {
  // State to hold the recognized text
  // const [currentDoc, setCurrentDoc] = useState<Doc | null>(null);

  const [path, setPath] = useState<string>("");
  const [allDocs, setAllDocs] = useState<Doc[]>([])
  const [currentDocs, setCurrentDocs] = useState<Doc[]>([]);

  // subscribe to the doc data
  useEffect(() => {
    const sub = client.models.Doc.observeQuery().subscribe({
      next: (data) => setAllDocs([...data.items]),
      error: (err) => console.error('Error fetching documents:', err),
    });
    return () => {
      sub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try{
        const { data: docs } = await client.models.Doc.list({
          filter: { path: { eq: path } },
        });
        console.log('useEffect fetchData: ', docs)
        console.log('path: ', path)
        const folders = docs.filter(doc=>doc.name.endsWith('/')).sort()
        console.log('folders:', folders)
        const docs_rest = docs.filter(doc=>!doc.name.endsWith('/')).sort()
        console.log('docs_rest:', docs_rest)
        setCurrentDocs([...folders, ...docs_rest]);
      }catch(error){
        console.log('Error fetching docs:', error)
      }
    };

    fetchData();
  }, [path, allDocs])

  // go up one layer
  function goUpLayer() {
    if (path == '') {
      console.log("Already at the root.")
      return;
    }
    if (!path.endsWith('/')) {
      throw new Error('Current path does not end with "/": ' + path);
    }
    let newPath = path.split('/').slice(0, -2).join('/') + '/';
    if (newPath == '/') newPath = '';
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
            path: `${root}${path}${file.name}`,
            data: file,
            options: {
              contentType: file.type, // contentType is optional
            },
          });
          const result = response_upload.result;
          console.log("response (upload doc s3): ", response_upload);

          // Create the API record:
          const bucket = Amplify.getConfig().Storage?.S3.bucket
          const region = Amplify.getConfig().Storage?.S3.region
          const response_create = await client.models.Doc.create({
            name: file.name,
            owner: user?.username,
            size: file.size,
            type: file.type,
            path: path,
            url: `https://${bucket}.s3.${region}.amazonaws.com/${root + path + file.name}`,
          });
          console.log("response (create doc data): ", response_create);

          return;
        })
      );
    } catch (error) {
      console.error("Error create Doc / file:", error);
    }
  }

  async function deleteDocFile(id: string) {

    try {

      // get the doc info
      const { data: docDelete } = await client.models.Doc.get({ id });
      const docPath = docDelete?.path!;
      const docName = docDelete?.name!;


      // remove doc file in storage
      const response_remove = await remove({
        path: `${root}${docPath}${docName}`,
      });
      console.log("response (remove s3 obj): ", response_remove);

      // delete the data
      const response_delete = await client.models.Doc.delete({
        id: id,
      });
      console.log("response (delete doc): ", response_delete);

      setCurrentDocs(currentDocs.filter((doc) => doc.id != id))

    } catch (error) {
      console.error("Error delete Doc / file:", error);
    }
  }

  async function createFolder() {
    try {
      // Create docs data and Upload all files to Storage:
      // Create the API record:
      const folderName = getValidFolderName();
      if (folderName !== null) {
        const response_create = await client.models.Doc.create({
          name: folderName + '/',
          path: path,
          type: 'folder',
          url: '#'
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

  async function deleteDocFolder(id: string) {
    try {
      // get the folder to delete
      const { data: folder } = await client.models.Doc.get({ id });
      const folderPath = folder?.path! + folder?.name;

      // get the docs in the folder
      console.log('folderPath: ', folderPath)
      const { data: docs } = await client.models.Doc.list({
        filter: {
          path: {
            beginsWith: folderPath
          },
        },
      });
      console.log('docs to delete: ', docs)

      // delete doc folder 
      const response_delete_folder = await client.models.Doc.delete({
        id: id,
      });
      console.log("response (delete doc folder): ", response_delete_folder);

      // delete doc inside the folder
      await Promise.all(
        Array.from(docs).map(async (file) => {
          // delete all data in that folder
          const response_delete = await client.models.Doc.delete({
            id: file.id,
          });
          console.log("response (delete doc): ", response_delete);

          // remove doc file in storage
          const response_remove = await remove({
            path: `${root}${file.path}${file.name}`,
          });
          console.log("response (remove s3 obj): ", response_remove);

          return;
        })
      );
    } catch (error) {
      console.error("Error remove Doc / file:", error);
    }
  }

  function deleteDoc(doc: Doc) {
    if (doc.type == 'folder') {
      deleteDocFolder(doc.id);
    } else {
      deleteDocFile(doc.id);
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
            accept=".pdf,.doc,.docx,.odt,image/*"
            onChange={createMultipleDocs}
            className="file-input"
            multiple
          />
        </label>

        <label className="file-input-label">
          <button
            className="file-input"
            onClick={() => { goUpLayer() }}
          >Go to upper layer</button>
          <button className="create-folder" onClick={() => { createFolder() }}>Create folder</button>
        </label>

      </div>

      <div className="folder-content-container">
        <ul>
          {currentDocs.map((doc) => (
            <li key={doc.id}>
              <a href={doc.url!} onClick={() => {
                if (doc.type == 'folder') {
                  console.log('old path: ', path);
                  setPath(doc.path! + doc.name);
                  console.log('new path: ', path);
                }
              }}>{doc.name}{" "}</a>
              <button onClick={() => deleteDoc(doc)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <Link href="/"><button>Return to Home</button></Link>

    </main>
  );
}

export default withAuthenticator(App);
