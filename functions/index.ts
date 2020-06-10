
import * as functions from 'firebase-functions';
import { app } from '../src/app';

export const bot = functions.https.onRequest(async (req, res) => {
    return app(req, res)
});
