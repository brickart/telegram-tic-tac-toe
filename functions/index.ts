
import * as functions from 'firebase-functions';
import { app } from '../src/bot';

export const bot = functions.https.onRequest(async (req, res) => {
    return app(req, res)
});
