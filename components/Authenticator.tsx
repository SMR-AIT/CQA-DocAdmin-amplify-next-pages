import { Authenticator, Button, Heading, useAuthenticator, useTheme, View, Image, Text } from "@aws-amplify/ui-react";
import { Email } from "@mui/icons-material";

export const components = {
  // Header() {
  //   const { tokens } = useTheme();

  //   return (
  //     <View textAlign="center" padding={tokens.space.large}>
  //       <Image
  //         alt="Amplify logo"
  //         src="https://docs.amplify.aws/assets/logo-dark.svg"
  //       />
  //     </View>
  //   );
  // },

  // Footer() {
  //   const { tokens } = useTheme();

  //   return (
  //     <View textAlign="center" padding={tokens.space.large}>
  //       <Text color={tokens.colors.neutral[80]}>
  //         &copy; All Rights Reserved
  //       </Text>
  //     </View>
  //   );
  // },

  SignIn: {
    Header() {
      const { tokens } = useTheme();

      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          登入帳戶
        </Heading>
      );
    },
    Footer() {
      const { toForgotPassword } = useAuthenticator();

      return (
        <View textAlign="center">
          <Button
            fontWeight="normal"
            onClick={toForgotPassword}
            size="small"
            variation="link"
          >
            重置密碼
          </Button>
        </View>
      );
    },
  },

  SignUp: {
    Header() {
      const { tokens } = useTheme();

      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          建新帳號
        </Heading>
      );
    },
    Footer() {
      const { toSignIn } = useAuthenticator();

      return (
        <View textAlign="center">
          <Button
            fontWeight="normal"
            onClick={toSignIn}
            size="small"
            variation="link"
          >
            回到登入頁面
          </Button>
        </View>
      );
    },
  },
  ConfirmSignUp: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          請輸入資訊:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },
  SetupTotp: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          請輸入資訊:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },
  ConfirmSignIn: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          請輸入資訊:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },
  ForgotPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          請輸入資訊:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },
  ConfirmResetPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          請輸入資訊:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },
};

export const formFields = {
  signIn: {
    // username: {
    //   placeholder: 'Enter your email',
    // },
    username:{
      label: '電子信箱',
      placeholder: '請輸入登入用的電子信箱',
      order: 1,
    },
    password: {
      label: '輸入密碼:',
      placeholder: '請輸入您的密碼',
      isRequired: true,
      order: 2,
    },
  },
  signUp: {
    email:{
      label: '電子信箱',
      placeholder: '請輸入登入用的電子信箱 (*@mail.smr.com.tw)',
      order: 1,
    },
    password: {
      label: '輸入密碼:',
      placeholder: '請輸入您的密碼',
      isRequired: true,
      order: 2,
    },
    confirm_password: {
      label: '確認密碼:',
      placeholder: '請再次確認您的密碼',
      order: 3,
    },
    nickname:{
      label: '輸入使用名稱:',
      placeholder: '請輸入公司內使用的英文名稱 (無法更改)',
      isRequired: true,
      order: 4,
    }    
  },
  forceNewPassword: {
    password: {
      placeholder: 'Enter your Password:',
    },
  },
  forgotPassword: {
    username: {
      placeholder: '請輸入你的Email:',
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      placeholder: 'Enter your Confirmation Code:',
      label: 'New Label',
      isRequired: false,
    },
    confirm_password: {
      placeholder: 'Enter your Password Please:',
    },
  },
  setupTotp: {
    QR: {
      totpIssuer: 'test issuer',
      totpUsername: 'amplify_qr_test_user',
    },
    confirmation_code: {
      label: 'New Label',
      placeholder: 'Enter your Confirmation Code:',
      isRequired: false,
    },
  },
  confirmSignIn: {
    confirmation_code: {
      label: 'New Label',
      placeholder: 'Enter your Confirmation Code:',
      isRequired: false,
    },
  },
};

export default function App() {
  return (
    <Authenticator formFields={formFields} components={components}>
      {({ signOut }) => <button onClick={signOut}>Sign out</button>}
    </Authenticator>
  );
}