declare namespace NodeJS {
  export interface ProcessEnv {
    REDIS_SYSTEM_URL: string;
    REDIS_SYSTEM_TOKEN: string;
    ALGOLIA_ID: string;
    ALGOLIA_WRITE_KEY: string;
    ALGOLIA_INDEX_NAME: string;
    DOMAIN: string;
    POS_API_KEY_1: string;
    POS_API_KEY_2: string;
    POS_API_KEY_3: string;
    POS_API_KEY_4: string;
  }
}
