import { defineStorage } from '@aws-amplify/backend';
import { defineFunction } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'amplify-next-cqa-doc-admin',
  access: (allow) => ({
    'Doc/*': [
      allow.authenticated.to(['read','write', "delete"]),
    ],
    'txt/*': [
      allow.authenticated.to(['read']),
    ],
    'Index/*': [
      allow.authenticated.to(['read']),
    ],
    'pdf/*': [
      allow.authenticated.to(['read']),
    ],
  })
    
});