import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import type { S3Handler } from 'aws-lambda';

// Create an instance of the Lambda client
const lambdaClient = new LambdaClient({ region: "ap-northeast-1" });

export const handler: S3Handler = async (event) => {
  const objectKeys = event.Records.map((record) => record.s3.object.key);
  console.log(`Delete handler invoked for objects [${objectKeys.join(', ')}]`);

  // Prepare the payload to pass to the other Lambda function
  const payload = JSON.stringify(event);

  // Create the command to invoke the Lambda function
  const command = new InvokeCommand({
    FunctionName: "onDelete2cqa",
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
    console.log('Successfully invoke delete function.');
    return;
  } catch (error) {
    console.error("Error invoking Lambda function", error);
    throw new Error("Failed to invoke Lambda function");
  }
};