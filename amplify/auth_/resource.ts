import { defineAuth } from "@aws-amplify/backend";
import { preSignUp } from "./pre-sign-up/resource";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "🌞歡迎使用日月精耀問答機器人管理系統🌝",
      verificationEmailBody: (createCode) => `您好:\n請使用此驗證碼驗證您的信箱: ${createCode()}\n`,
    },
  },
    
  userAttributes: {
    nickname:{
      mutable: false,
      required: true,
    },    
  },

  groups: ["ADMINS", "EDITORS"],

  triggers: {
    preSignUp,
  },
});
