import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { list } from 'aws-amplify/storage';


Amplify.configure(outputs);
// const root = "Doc/";

// Generating the client
const client = generateClient<Schema>({
    authMode: "apiKey",
});
// client.queries.buildVDB({name:''})
type Doc = Schema["Doc"]["type"];

export async function updateDocStatus() {
    const s3_result = await list({ path: 'txt/', });
    const s3_keys = s3_result['items'].map((item) => item['path'].slice(5))
    console.log(s3_keys)

    const data_result = await client.models.Doc.list()
    const data_ids = data_result['data'].map((data) => data.id)
    console.log(data_ids)

    // for (const key in s3_keys){
    //     data_ids.filter((id)=>id.startsWith(key))
    //     client.models.Doc.update({ id: '123', statusText: 'Done' });
    // }
}