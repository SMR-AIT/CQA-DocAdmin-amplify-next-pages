import type { Schema } from "../amplify/data/resource"
import { generateClient } from "aws-amplify/api"
// import outputs from "../amplify_outputs.json"
// import { Amplify } from "aws-amplify"
// Amplify.configure(outputs)
const client = generateClient<Schema>()

export async function triggerBuildVdb() {
    try {
        const { data, errors } = await client.queries.buildVDB({
            name: 'hello world!!!'
        });

        if (errors) {
            console.error("GraphQL errors:", errors);
        } else {
            console.log("Data received:", data);
        }
    } catch (error) {
        console.error("Error occurred:", error);
    }
}