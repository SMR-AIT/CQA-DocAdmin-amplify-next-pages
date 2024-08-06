import type { PreSignUpTriggerHandler } from "aws-lambda";
// import { env } from '$amplify/env/pre-sign-up';

export const handler: PreSignUpTriggerHandler = async (event) => {
  const email = event.request.userAttributes["email"];

  if (
    !email.endsWith("@smr.com.tw")||!email.endsWith("@mail.smr.com.tw")
  ) {
    throw new Error("Invalid email domain");
  }

  return event;
};
