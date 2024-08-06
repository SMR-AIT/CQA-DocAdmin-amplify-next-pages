import { generateClient } from "aws-amplify/api";
import type { Schema } from "../amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";

function getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

const timestamp = getCurrentTimestamp();
// console.log("Current timestamp:", timestamp);

// Generating the client
const client = generateClient<Schema>({
    authMode: "apiKey",
});

interface logProps {
    name: string,
    action: string,
    object: string
}

export async function create_log(props: logProps) {
    const { errors, data: newLog } = await client.models.log.create(props);
    if (errors) {
        console.log('errors: ', errors);
    }
}

