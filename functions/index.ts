
import * as functions from 'firebase-functions';
const { app } = require('./app/app');

export const bot = functions.https.onRequest(async (req, res) => {
    return app(req, res)
});
