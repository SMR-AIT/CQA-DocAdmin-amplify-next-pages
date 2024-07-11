import type { Schema } from "../amplify/data/resource"
import { generateClient } from "aws-amplify/api"
// import outputs from "../amplify_outputs.json"
// import { Amplify } from "aws-amplify"
// Amplify.configure(outputs)
const client = generateClient<Schema>()

export async function triggerBuildVdb(){
    const { data, errors } = await client.queries.buildVDB({
        name: 'hello world!!!'
      });
}