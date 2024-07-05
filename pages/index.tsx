import Link from 'next/link';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'


Amplify.configure(outputs);

export default function Home() {
  return (

    <Authenticator>
      {({ signOut }) => (
        <main>
          <h1>SMR CQA DocAdmin</h1>
          <ul>
            <li><Link href="/file-explorer">File Explorer</Link></li>
            <li><Link href="/change-logs">Change Logs</Link></li>
            <li><Link href="/forum">Forum</Link></li>
            <li><Link href="/todos">To Do List</Link></li>
          </ul>
          <button onClick={signOut}>Sign out</button>
        </main>

      )}
    </Authenticator>
  );
}
