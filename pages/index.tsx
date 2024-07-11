import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import FileExplorer from "@/components/FileExplorer";

Amplify.configure(outputs);

export default function Home() {
  return (
    <Authenticator>
      {({ signOut }) => (
        <main>
          <FileExplorer />
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}
