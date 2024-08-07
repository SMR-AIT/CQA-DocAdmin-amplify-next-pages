import { generateClient } from "aws-amplify/api";
import type { Schema } from "../amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";

function getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

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

export async function get_logs() {
    try {
        const { errors, data: allLogs } = await client.models.log.list();
        if (errors) {
            console.log('errors: ', errors);
            return null; // Return null or an appropriate value if there are errors
        }
        return allLogs;
    } catch (error) {
        console.error("Error fetching logs:", error);
        return null; // Handle any additional errors from the API call
    }
}

interface getLogProps{
    id:string
}

export async function get_log(props:getLogProps) {
    try {
        const { errors, data: log } = await client.models.log.get(props);
        if (errors) {
            console.log('errors: ', errors);
            return null; // Return null or an appropriate value if there are errors
        }
        console.log('new log: ', log);
        return log;
    } catch (error) {
        console.error("Error fetching logs:", error);
        return null; // Handle any additional errors from the API call
    }
}
