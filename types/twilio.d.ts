declare global {
    namespace NodeJS {
      interface ProcessEnv {
        TWILIO_ACCOUNT_SID: string;
        TWILIO_AUTH_TOKEN: string;
        TWILIO_PHONE_NUMBER: string;
        NEXT_PUBLIC_TWILIO_APP_SID?: string;
        // Deepgram Speech-to-Text
        DEEPGRAM_API_KEY: string;
        // WebSocket Server (now hosted on Render.com)
        WEBSOCKET_URL?: string;
        NEXT_PUBLIC_WEBSOCKET_URL?: string;
        // Base URL for callbacks
        NEXT_PUBLIC_BASE_URL?: string;
      }
    }
  }
  
  export {};