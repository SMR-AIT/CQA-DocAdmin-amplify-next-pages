import { S3Event, S3Handler } from 'aws-lambda';
// import AWS from 'aws-sdk';
import fetch from 'node-fetch';

const appsyncUrl = 'YOUR_APPSYNC_ENDPOINT'; // Replace with your AppSync endpoint
const region = 'YOUR_AWS_REGION'; // Replace with your AWS region

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

export const handler: S3Handler = async (event: S3Event) => {
    const objectKeys = event.Records.map(record => record.s3.object.key);
    console.log(`Upload handler invoked for objects [${objectKeys.join(', ')}]`);

    // Iterate through each object key and execute mutation
    for (const key of objectKeys) {

        let status = ''
        let id = ''
        if (key.endsWith('Extract_doc_squeezed.txt')) { 
            status = 'statusText'; 
            id = key.slice(0, -('Extract_doc_squeezed.txt'.length+1))
        }
        else if (key.endsWith('Summary_chatgpt.txt')) { status = 'statusSummary'; }
        else if (key.endsWith('Embeddings.npy')) { status = 'statusEmbed'; }
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
