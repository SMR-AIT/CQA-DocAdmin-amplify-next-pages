import "@/styles/app.css";
import type { AppProps } from "next/app";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import ResponsiveAppBar from "@/components/AppBar";
import { Box } from "@mui/material";
import { Authenticator } from "@aws-amplify/ui-react";

Amplify.configure(outputs);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Authenticator>
      {({ signOut }) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }}
        >
          <ResponsiveAppBar signOut={signOut!} />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
            }}
          >
            <Component {...pageProps} />
          </Box>
        </Box>
      )}
    </Authenticator>
  );
}
