import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

import "@aws-amplify/ui-react/styles.css";
import FileExplorer from "@/components/FileExplorer/index";

Amplify.configure(outputs);

export default function Home() {
  return (
    <main>
      <FileExplorer />
    </main>
  );
}
