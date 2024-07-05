import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'amplify-next-cqa-doc-admin',
  access: (allow) => ({
    'Doc/*': [
      allow.authenticated.to(['read','write', "delete"]),
    ],
  })
});