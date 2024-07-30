import { generateClient } from "aws-amplify/api";
import { uploadData, remove } from "aws-amplify/storage";
import React from "react";
import type { Schema } from "../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import getValidFolderName from "./GetFolderName";
import "@aws-amplify/ui-react/styles.css";
import { normalize_filename } from "./FileNameLogic";

Amplify.configure(outputs);
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
    console.log('enter upload')
    if (!files) return;
    console.log('enter upload2')
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
                    url: `https://${bucket}.s3.${region}.amazonaws.com/${root + path + file_name
                        }`,
                });
                console.log("response (create doc data): ", response_create);

                return;
            })
        );

        if (skippedFiles.length != 0) {
            alert("已有相同名稱的檔案存在於此路徑，請刪除後再上傳:\n" + skippedFiles.join(',\n'));
        }
    } catch (error) {
        console.error("Error create Doc / file:", error);
    }
}

export async function setDocFileStatus(id: string, status:('Undone'| 'Pending'| 'Done')) {
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

export async function deleteDocFile(id: string) {
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

        // setCurrentDocs(currentDocs.filter((doc) => doc.id != id));
    } catch (error) {
        console.error("Error delete Doc / file:", error);
    }
}

export async function createFolder(path: string, hasID: (id: string) => boolean) {
    let folderName = 'New Folder';
    while (true) {
        folderName = getValidFolderName()!;
        const id = path + folderName + '/';
        if (!hasID(id)) break;
        else alert("已存在同樣名稱的資料夾在此路徑，請重新命名。")
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
                statusEmbed: '',
                statusText: '',
                statusPdf: '',
                statusVdb: '',
                statusSummary: ''
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


// export async function setFolderDelete(id: string) {
//     try {

//         // get the docs in the folder
//         const { data: docs } = await client.models.Doc.list({
//             filter: {
//                 id: { beginsWith: id, },
//             },
//         });
//         console.log("docs to delete: ", docs);

//         // delete doc inside the folder
//         await Promise.all(
//             Array.from(docs).map(async (file) => {

//                 // delete all data in that folder
//                 const { data: updatedDoc, errors } = await client.models.Doc.update({
//                     id: file.id,
//                     status: ''
//                 });
//                 if (errors) {
//                     console.log("errors deleting doc: ", errors);
//                 }

//                 return;
//             })
//         );
//     } catch (error) {
//         console.error("Error remove Doc / file:", error);
//     }
// }

export function deleteDoc(doc: Doc) {
    if (doc.type == "folder") {
        deleteDocFolder(doc.id);
    } else {
        deleteDocFile(doc.id);
    }
}

// export async function removeDeletedStatusFolderData() {
//     const { data: docs, errors } = await client.models.Doc.list({
//         filter: {
//             status: {
//                 eq: 'deleted',
//             },
//         },
//     });

//     if (errors) {
//         console.error(errors);
//         return;
//     }

//     // delete files
//     // docs.map(doc => { deleteDoc(doc); })
//     return;
// }


export async function setUndone2Pending(allDocs:Doc[]) {
    try {

        // delete doc inside the folder
        await Promise.all(
            Array.from(allDocs).map(async (doc) => {

                // update all data in that folder
                if (doc.status=='Undone'){
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