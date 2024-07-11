import { defineFunction } from '@aws-amplify/backend';

export const buildVDB = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'buildVDB',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handler.ts',
  // memoryMB: 128, // allocate XXX MB of memory to the function.
  // timeoutSeconds: 15 // 1 minute timeout
});