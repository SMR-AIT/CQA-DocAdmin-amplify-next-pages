import { StorageManager } from "@aws-amplify/ui-react-storage";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useEffect, useState } from "react";
import Link from "next/link";

const client = generateClient<Schema>();

interface ProcessFileParams {
  key: string;
  file: File;
}

const FileExplorer = (path: string, userName: string) => {
  const [objs, setObjs] = useState<Array<Schema["Doc"]["type"]>>([]);
  const [currentObjs, setCurrentObjs] = useState<Array<Schema["Doc"]["type"]>>(
    []
  );

  useEffect(() => {
    const sub = client.models.Doc.observeQuery().subscribe({
      next: (data) => setObjs([...data.items]),
    });
    return () => {
      sub.unsubscribe();
    };
  }, []);

  // update current path objs whenever the objs is changed
  useEffect(() => {
    setCurrentObjs(objs.filter((obj) => obj.path == path));
  }, [objs]);

  // function getCurrentLayerFiles() {
  //   console.log("hahaha gotcha");

  //   return Math.random().toString();
  // }

  function createObj({ file }: { file: File }) {
    client.models.Doc.create({
      name: file.name,
      lastModified: Math.floor(file.lastModified / 1000).toString(),
      size: file.size,
      path: path,
      owner: userName,
    });
  }

  function onUploadSuccess_0(file: { key?: string | undefined }) {
    console.log(file);
  }

  function deleteObj(id: string) {
    client.models.Doc.delete({ id });
  }

  const processFile = ({ file, key }: ProcessFileParams) => {
    createObj({ file });
    return {
      file,
      key,
      metadata: {
        id: key,
      },
    };
  };

  return (
    <div>
      <h1>File Explorer</h1>
      <ul>
        {currentObjs.map((obj) => (
          <li key={obj.id}>
            {obj.name} <button onClick={() => deleteObj(obj.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <StorageManager
        acceptedFileTypes={["Image/*"]}
        path="Doc/"
        maxFileCount={1}
        autoUpload={false}
        isResumable
        onUploadSuccess={onUploadSuccess_0}
        processFile={processFile}
      />
      <Link href="/">
        <button>Return to Home</button>
      </Link>
    </div>
  );
};

export default FileExplorer;
