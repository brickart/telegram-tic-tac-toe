import { Request, Response } from 'express';
import { bot } from './bot';

const express = require('express');
const app = express();

app.use(express.json());

app.post(`/`, (req: Request, res: Response) => {
    bot.processUpdate(req['body']);
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log('listen on port 3000')
})

export { app };
