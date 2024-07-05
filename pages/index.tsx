import Link from 'next/link';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

export default function Home() {
  return (
    <main>
      <h1>SMR CQA DocAdmin</h1>
      <ul>
        <li><Link href="/file-explorer">File Explorer</Link></li>
        <li><Link href="/change-logs">Change Logs</Link></li>
        <li><Link href="/forum">Forum</Link></li>
        <li><Link href="/todos">To Do List</Link></li>
      </ul>
    </main>
  );
}
