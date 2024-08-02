import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
// import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
// import Menu from "@mui/material/Menu";
// import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
// import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
// import Tooltip from "@mui/material/Tooltip";
// import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import { UseAuthenticator } from "@aws-amplify/ui-react-core";
// import AccountMenu from "./AccountMenu";
// import { signOut } from "aws-amplify/auth";
export type SignOut = UseAuthenticator["signOut"];

interface page {
  name: string;
  href: string;
}
const createData = (name: string, href: string): page => {
  return { name: name, href: href };
};
const pages = [
  createData("File Explorer", "/file-explorer"),
  createData("Change Logs", "/change-logs"),
  //   createData("Forum", "/forum"),
  //   createData("ToDo List", "/todos"),
];

interface ResponsiveAppBarProps {
  signOut: SignOut;
}

function ResponsiveAppBar({ signOut: SignOut_func }: ResponsiveAppBarProps) {
  const [userState, setUserState] = React.useState<"登入" | "登出">("登出");

  const handleSignout = () => {
    if (userState === "登出") {
      SignOut_func();
      setUserState("登入");
      return;
    } else if (userState === "登入") {
      setUserState("登出");
      return;
    }
  };

  return (
    <AppBar position="fixed" sx={{ height: "10vh", overflow: "hidden" }}>
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ justifyContent: "space-evenly", width: "100%" }}
        >
          <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/file-explorer"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            SMRxCQA
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component="a"
                href={page.href}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Button
              key='signout'
              onClick={handleSignout}
              component="a"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              {userState}
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
