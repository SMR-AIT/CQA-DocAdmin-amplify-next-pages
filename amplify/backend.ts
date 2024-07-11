import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { buildVDB } from './functions/buildVDB/resource';
import { sayHello } from './functions/say-hello/resource';

defineBackend({
  auth,
  data,
  storage,
  buildVDB,
  sayHello
});
