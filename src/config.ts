import * as functions from 'firebase-functions';
import * as dotenv from 'dotenv';
dotenv.config();

const isDevMode = process.env.NODE_ENV === 'development';
const TOKEN: string = isDevMode ? process.env.TOKEN : functions.config().bot.token;
const URL: string = isDevMode ? process.env.URL : functions.config().bot.url;

export { TOKEN, URL }
