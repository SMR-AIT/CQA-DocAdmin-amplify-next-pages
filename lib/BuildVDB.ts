import type { Schema } from "../amplify/data/resource"
import { generateClient } from "aws-amplify/api"

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