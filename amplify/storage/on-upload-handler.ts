import { S3Event, S3Handler } from 'aws-lambda';
// import AWS from 'aws-sdk';
import fetch from 'node-fetch';

const appsyncUrl = 'https://ufvdkwwg3zcu3n2rqdprati5ra.appsync-api.ap-northeast-1.amazonaws.com/graphql';
const region = 'ap-northeast-1'; // Replace with your AWS region

// Function to execute GraphQL mutation against AppSync
async function executeGraphQLMutation(mutation: string, variables: any) {
    const response = await fetch(appsyncUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: mutation,
            variables,
        }),
    });

    return response.json();
}

const folder_doc = 'Doc/'
const folder_index = 'Index/'
const folder_pdf = 'pdf/'
const folder_txt = 'txt/'

const file_txt = 'Extract_doc_squeezed.txt';
const file_sum = 'Summary_chatgpt.txt';
const file_ebd = 'Embeddings.npy';

export const handler: S3Handler = async (event: S3Event) => {
    const objectKeys = event.Records.map(record => record.s3.object.key);
    console.log(`Upload handler invoked for objects [${objectKeys.join(', ')}]`);

    // Iterate through each object key and execute mutation
    for (const key of objectKeys) {

        let status = ''
        let id = ''
        if (key.endsWith(file_txt)) { 
            status = 'statusText'; 
            id = key.slice(folder_txt.length, -(file_txt.length+1));
        }
        else if (key.endsWith(file_sum)) { 
            status = 'statusSummary'; 
            id = key.slice(folder_txt.length, -(file_sum.length+1));
        }
        else if (key.endsWith(file_ebd)) { 
            status = 'statusEmbed'; 
            id = key.slice(folder_txt.length, -(file_ebd.length+1));
        }
        if (status == '') continue;

        const mutation = `
        mutation UpdateDoc($id: ID!, $status: String!) {
          updateDoc(input: {id: $id, ${status}: $status}) {
            id
            name
            statusText
            updatedAt
          }
        }
      `;
      console.log("query: " + mutation);
        let variables = {
            id: key, // Assuming object key is the document ID
            status: 'Done', // Example status update
        };

        try {
            const response = await executeGraphQLMutation(mutation, variables);
            console.log(`Mutation executed for document ID ${key}:`, response);
        } catch (error) {
            console.error(`Error executing mutation for document ID ${key}:`, error);
        }
    }
};
