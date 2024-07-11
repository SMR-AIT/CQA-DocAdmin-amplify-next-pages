import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import type { Schema } from "../../data/resource";

// Create an instance of the Lambda client
const lambdaClient = new LambdaClient({ region: "ap-northeast-1" });

export const handler: Schema["buildVDB"]["functionHandler"] = async (event) => {
  // arguments typed from `.arguments()`
  const { name } = event.arguments;

  // Prepare the payload to pass to the other Lambda function
  const payload = JSON.stringify({ name });

  // Create the command to invoke the Lambda function
  const command = new InvokeCommand({
    FunctionName: "CodebuildTrigger-CQA-develop",
    Payload: new TextEncoder().encode(payload), // encode payload to Uint8Array
  });

  try {
    // Invoke the other Lambda function
    const response = await lambdaClient.send(command);

    // Decode the response payload (if any)
    const responsePayload = response.Payload ? new TextDecoder().decode(response.Payload) : null;

    // Process the response from the invoked Lambda function (if needed)
    const result = responsePayload ? JSON.parse(responsePayload) : null;

    // Return a response
    return `Hello, ${name}! Invoked another Lambda with response: ${result}`;
  } catch (error) {
    console.error("Error invoking Lambda function", error);
    throw new Error("Failed to invoke Lambda function");
  }
};
