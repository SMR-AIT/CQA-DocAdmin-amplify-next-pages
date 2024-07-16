import { defineStorage } from '@aws-amplify/backend';
import { defineFunction } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'amplify-next-cqa-doc-admin',
  access: (allow) => ({
    'Doc/*': [
      allow.authenticated.to(['read','write', "delete"]),
    ],
  }),
    
  triggers: {
    onUpload: defineFunction({
      entry: './on-upload-handler.ts'
    }),
    onDelete: defineFunction({
      entry: './on-delete-handler.ts'
    })
  }
});