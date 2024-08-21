import { Authenticator, Button, Heading, useAuthenticator, useTheme, View, Image, Text } from "@aws-amplify/ui-react";
import { I18n } from 'aws-amplify/utils';
import { translations } from '@aws-amplify/ui-react';
I18n.putVocabularies(translations);
I18n.setLanguage('zh');

I18n.putVocabularies({
  zh: {
    'Sign In': '登入',
    'Sign in': '登入',
    'Sign Up': "註冊",
    'Create Account': "創建帳戶",
    'Send code':"傳送驗證碼",
    "Back to Sign In":"回到登入畫面",
    "Email":"電子郵件",
    "Confirm": "確認",
    "Resend Code": "重發驗證碼",
    "Code": "驗證碼",
    "Submit":"提交",
    "New Password":"新密碼",
    "Confirm Password":"確認密碼",
    "Confirmation Code":"驗證碼",
    "Enter your code": "請輸入驗證碼",
    "Your code is on the way. To log in, enter the code we emailed to {Email}. It may take a minute to arrive.":"你的驗證碼已寄到此電子郵件 {Email}，可能會需要等候一分鐘。",
    "User already exists":"此電子郵件已經存在",
    "Your passwords must match":"請確認密碼相同",
    "Password must have at least 8 characters": "需要至少8個字元",
    "Password must have lower case letters":"需要至少一個小寫字母",
    "Password must have upper case letters":"需要至少一個大寫字母",
    "Password must have special characters":"需要至少一個特殊符號",
    "Password must have numbers":"需要至少一個數字",
    "PreSignUp failed with error Invalid email domain.":"請使用公司的電子郵件註冊"
  }
});

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
          // padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          請輸入資訊:
        </Heading>
      );
    },
    Footer() {
      return <Text></Text>;
    },
  },
  SetupTotp: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          // padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          請輸入資訊:
        </Heading>
      );
    },
    Footer() {
      return <Text></Text>;
    },
  },
  ConfirmSignIn: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          // padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          請輸入資訊:
        </Heading>
      );
    },
    Footer() {
      return <Text></Text>;
    },
  },
  ForgotPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          // padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          請輸入資訊:
        </Heading>
      );
    },
    Footer() {
      return <Text></Text>;
    },
  },
  ConfirmResetPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          // padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          請輸入資訊:
        </Heading>
      );
    },
    Footer() {
      return <Text></Text>;
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
      placeholder: '請輸入密碼',
    },
  },
  forgotPassword: {
    username: {
      placeholder: '請輸入Email',
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      placeholder: '請輸入驗證碼',
      label: '驗證碼',
      isRequired: false,
    },
    confirm_password: {
      placeholder: '請輸入密碼',
    },
  },
  setupTotp: {
    QR: {
      totpIssuer: 'test issuer',
      totpUsername: 'amplify_qr_test_user',
    },
    confirmation_code: {
      label: 'New Label',
      placeholder: '請輸入驗證碼',
      isRequired: false,
    },
  },
  confirmSignIn: {
    confirmation_code: {
      label: 'New Label',
      placeholder: '請輸入驗證碼',
      isRequired: false,
    },
  },
};

export default function App() {
  return (
    <Authenticator formFields={formFields} components={components}>
      {({ signOut }) => <button onClick={signOut}>登出</button>}
    </Authenticator>
  );
}