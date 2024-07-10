import "@/styles/app.css";
import type { AppProps } from "next/app";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import ResponsiveAppBar from "@/components/AppBar";
import { Box, Paper } from "@mui/material";

Amplify.configure(outputs);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <ResponsiveAppBar />
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
  );
}
