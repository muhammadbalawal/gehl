declare global {
    namespace NodeJS {
      interface ProcessEnv {
        TWILIO_ACCOUNT_SID: string;
        TWILIO_AUTH_TOKEN: string;
        TWILIO_PHONE_NUMBER: string;
        NEXT_PUBLIC_TWILIO_APP_SID?: string;
      }
    }
  }
  
  export {};