declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    readonly RAZORPAY_KEY_ID?: string;
    readonly [key: string]: string | undefined;
  }
}
