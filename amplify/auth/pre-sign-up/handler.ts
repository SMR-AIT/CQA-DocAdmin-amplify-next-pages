import type { PreSignUpTriggerHandler } from "aws-lambda";
// import { env } from '$amplify/env/pre-sign-up';

export const handler: PreSignUpTriggerHandler = async (event) => {
  const email = event.request.userAttributes["email"];

  if (!email.endsWith("gmail.com")) {
    throw new Error("Invalid email domain");
  }

  return event;
};
