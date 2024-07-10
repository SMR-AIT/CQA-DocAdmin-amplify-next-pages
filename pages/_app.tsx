import "@/styles/app.css";
import type { AppProps } from "next/app";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import ResponsiveAppBar from "@/components/AppBar";

Amplify.configure(outputs);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ResponsiveAppBar />
      <Component {...pageProps} />
    </>
  );
}
