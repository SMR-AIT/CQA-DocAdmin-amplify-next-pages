import { generateClient } from "aws-amplify/api";
import { uploadData, remove } from "aws-amplify/storage";
import React from "react";
import type { Schema } from "../amplify/data/resource";
import { Amplify } from "aws-amplify";
import getValidFolderName from "./GetFolderName";
import "@aws-amplify/ui-react/styles.css";
import { normalize_filename } from "./FileNameLogic";
import { create_log } from "./LogOps";

const root = "Doc/";

// Generating the client
const client = generateClient<Schema>({
  authMode: "apiKey",
});

type Doc = Schema["Doc"]["type"];


// go up one layer
export function goUpLayer(path: string, setNewPath: React.Dispatch<React.SetStateAction<string>>) {
  if (path == "") {
    console.log("Already at the root.");
    return;
  }
  if (!path.endsWith("/")) {
    throw new Error('Current path does not end with "/": ' + path);
  }
  let newPath = path.split("/").slice(0, -2).join("/") + "/";
  if (newPath == "/") newPath = "";
  console.log("newPath: ", newPath);
  setNewPath(newPath);
}


export async function createMultipleDocs(path: string, files: FileList, userName: string, hasID: (id: string) => boolean) {
  if (!files) return;
  try {
    const skippedFiles: string[] = []

    // Create docs data and Upload all files to Storage:
    await Promise.all(
      Array.from(files).map(async (file) => {
        const file_name = normalize_filename(file.name)
        // check if the file already exist
        const id = path + file_name;
        if (hasID(id)) {
          skippedFiles.push('   \t' + file_name)
          console.log('Skip file: ', file_name)
          return;
        }

        // upload doc file to storage
        const response_upload = await uploadData({
          path: `${root}${path}${file_name}`,
          data: file,
          options: {
            contentType: file.type, // contentType is optional
          },

        });
        console.log("response (upload doc s3): ", response_upload.result);
        console.log("response (upload doc s3): ", response_upload);

        // Create the API record:
        const bucket = Amplify.getConfig().Storage?.S3.bucket;
        const region = Amplify.getConfig().Storage?.S3.region;
        const response_create = await client.models.Doc.create({
          id: id,
          name: file_name,
          owner: userName,
          size: file.size,
          type: file.type,
          path: path,
          status: 'Undone',
          statusEmbed: 'Undone',
          statusText: 'Undone',
          statusPdf: 'Undone',
          statusVdb: 'Undone',
          statusSummary: 'Undone',
          url: `https://${bucket}.s3.${region}.amazonaws.com/${root + path + file_name
            }`,
        });
        console.log("response (create doc data): ", response_create);
        create_log({name: '自動', action:'成功上傳檔案', object:`已上傳檔案 "./${id}"`});
        return;
      })
    );

    if (skippedFiles.length != 0) {
      alert("已有相同名稱的檔案存在於此路徑，請刪除後再上傳:\n" + skippedFiles.join(',\n'));
    }
  } catch (error) {
    console.error("Error create Doc / file:", error);
    const filenames = Array.from(files).map(file => file.name).join(', ');
    create_log({name: '自動', action:'上傳檔案失敗', object:`上傳檔案 "${filenames}" 的過程中發生了錯誤。`});
  }
}

export async function setDocFileStatus(id: string, status: ('Undone' | 'Pending' | 'Done')) {
  try {
    // get the doc info
    const { data: updatedDoc, errors } = await client.models.Doc.update({ id: id, status: status });

    // Check if there are any errors returned by the update call
    if (errors) {
      console.error('Errors updating the doc:', errors);
      return;
    }

    // Log the updated document information
    console.log('Document updated successfully:', updatedDoc);
  } catch (error) {
    console.error("Error updating Doc / file:", error);
  }
}

/**
* Automatically detect if the doc is a folder or not.
* If it is a folder, then redirect to deleteDocFolder(id) function. * 
 * @param id 
 * @returns 
 */
export async function deleteDocFile(id: string) {

  try {
    // get the doc info
    const { data: docDelete } = await client.models.Doc.get({ id });
    if (docDelete?.type == 'folder') {
      deleteDocFolder(id);
      return;
    }
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
    create_log({name: '自動', action:'成功刪除檔案', object:`已刪除檔案 "${id}"`});

    // setCurrentDocs(currentDocs.filter((doc) => doc.id != id));
  } catch (error) {
    console.error("Error delete Doc / file:", error);
    create_log({name: '自動', action:'刪除檔案失敗', object:`刪除檔案 "${id}" 的過程中發生了錯誤。`});
  }
}

export async function createFolder(user:string, path: string, hasID: (id: string) => boolean) {
  let folderName = 'New Folder';
  while (true) {
    folderName = getValidFolderName()!;
    const id = path + folderName + '/';
    if (!hasID(id)) break;
    else {
      alert("已存在同樣名稱的資料夾在此路徑，請重新命名。")
    }
  }
  try {
    // Create docs data and Upload all files to Storage:
    // Create the API record:
    const { data: todo, errors } = await client.models.Doc.get({
      id: path + folderName + "/",
    });

    if (folderName !== null) {
      const response_create = await client.models.Doc.create({
        id: path + folderName + "/",
        name: folderName + "/",
        path: path,
        type: "folder",
        url: "#",
        status: "-",
        statusEmbed: '-',
        statusText: '-',
        statusPdf: '-',
        statusVdb: '-',
        statusSummary: '-'
      });
      console.log("response (create folder): ", response_create);
      create_log({name: user, action:'成功建立資料夾', object:`已建立資料夾路徑: "./${path}${folderName}/"`});

    } else {
      console.log("User canceled the input.");
    }
    return;
  } catch (error) {
    console.error("Error create Doc / file:", error);
  }
}

export async function deleteDocFolder(id: string) {
  try {
    // get the folder to delete
    const { data: folder } = await client.models.Doc.get({ id });
    const folderPath = folder?.path! + folder?.name;

    // get the docs in the folder
    console.log("folderPath: ", folderPath);
    const { data: docs } = await client.models.Doc.list({
      filter: {
        path: {
          beginsWith: folderPath,
        },
      },
    });
    console.log("docs to delete: ", docs);

    // delete doc folder
    const response_delete_folder = await client.models.Doc.delete({
      id: id,
    });
    console.log("response (delete doc folder): ", response_delete_folder);

    // delete doc inside the folder
    create_log({name: '自動', action:'開始刪除資料夾', object:`開始刪除資料夾 "${id}"`});
    await Promise.all(
      Array.from(docs).map(async (file) => {
        // delete all data in that folder
        deleteDocFile(file.id);
        return;
      })
    );
  } catch (error) {
    console.error("Error remove Doc / file:", error);
    create_log({name: '自動', action:'刪除資料夾失敗', object:`刪除資料夾 "${id}" 的過程中發生了錯誤。`});
  }
}



export function deleteDoc(doc: Doc) {
  if (doc.type == "folder") {
    deleteDocFolder(doc.id);
  } else {
    deleteDocFile(doc.id);
  }
}

export async function refreshStatus(allDocs: Doc[]) {
  try {
    const statusList: Array<keyof Doc> = ['status', 'statusEmbed', 'statusText', 'statusPdf', 'statusSummary', 'statusVdb']
    // delete doc inside the folder
    await Promise.all(
      Array.from(allDocs).map(async (doc) => {

        // update all data in that folder
        if (doc.status == 'Pending') {
          const { data: updatedDoc, errors } = await client.models.Doc.update({
            id: doc.id,
            status: doc.status == 'Pending' ? 'Undone' : doc.status,
            statusText: doc.statusText == 'Pending' ? 'Undone' : doc.statusText,
            statusPdf: doc.statusPdf == 'Pending' ? 'Undone' : doc.statusPdf,
            statusSummary: doc.statusSummary == 'Pending' ? 'Undone' : doc.statusSummary,
            statusEmbed: doc.statusEmbed == 'Pending' ? 'Undone' : doc.statusEmbed,
            statusVdb: doc.statusVdb == 'Pending' ? 'Undone' : doc.statusVdb,
          });
          if (errors) {
            console.log("errors update doc: ", errors);
          }
        }

        return;
      })
    );
  } catch (error) {
    console.error("Error remove Doc / file:", error);
  }
}

export async function setUndone2Pending(allDocs: Doc[]) {
  try {

    // delete doc inside the folder
    await Promise.all(
      Array.from(allDocs).map(async (doc) => {

        // update all data in that folder
        if (doc.status == 'Undone') {
          const { data: updatedDoc, errors } = await client.models.Doc.update({
            id: doc.id,
            status: 'Pending',
            statusEmbed: 'Pending',
            statusText: 'Pending',
            statusPdf: 'Pending',
            statusSummary: 'Pending',
            statusVdb: 'Pending',
          });
          if (errors) {
            console.log("errors update doc: ", errors);
          }
        }

        return;
      })
    );
  } catch (error) {
    console.error("Error remove Doc / file:", error);
  }
}