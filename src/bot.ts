const TelegramBot = require('node-telegram-bot-api');
import { Request, Response } from 'express';
import { TOKEN, URL } from './config';
import { InlineKeyboardButton } from 'node-telegram-bot-api';

const bot = new TelegramBot(TOKEN);
bot.setWebHook(URL);

const express = require('express');
const app = express();

app.use(express.json());

app.post(`/`, (req: Request, res: Response) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('listen on port 3000')
})

export { app };



bot.on('message', (msg: any) => {
  // TODO: Make instructions!
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});

bot.on('callback_query', (query: any) => {
  console.log({query})

  const { inline_message_id } = query;
  const gameData = parseGameData(query.data);
  const winMessage = `A winner is ${query.from.first_name} ${query.from.last_name} \n${generateEndMessage(gameData)}`;

  switch (gameData.action) {
    case 1:
      gameData.p1 = query.from.id;
      gameData.tire = gameData.tire === 1 ? 2 : 1;
      console.log({ gameData})
      bot.editMessageText(`This is game ${decodeButtonText(gameData.tire)}`, {
        inline_message_id,
        reply_markup: {
          inline_keyboard: gameData.p1 && gameData.p2 ? generateGameKeyboard(stringifyGameData(gameData)) : generateSetupKeyboard(gameData)
        }
      })
      return;
    case 2:
      gameData.p2 = query.from.id;
      gameData.tire = gameData.tire === 1 ? 2 : 1;
      console.log({ gameData })
      bot.editMessageText(`This is game ${decodeButtonText(gameData.tire)}`, {
        inline_message_id,
        reply_markup: {
          inline_keyboard: gameData.p1 && gameData.p2 ? generateGameKeyboard(stringifyGameData(gameData)) : generateSetupKeyboard(gameData)
        }
      })
      return;
    case 3:
      if (gameData.tire === 1 && gameData.p1 !== query.from.id) return;
      if (gameData.tire === 2 && gameData.p2 !== query.from.id) return;
      gameData.tire = gameData.tire === 1 ? 2 : 1; 
      const win = isWin(gameData.game);
      bot.editMessageText(win ? winMessage : `This is game ${decodeButtonText(gameData.tire)}`, {
        inline_message_id,
        reply_markup: {
          inline_keyboard: win ? [] : generateGameKeyboard(stringifyGameData(gameData))
        }
      })
      return;

  
    default:
      break;
  }
});

bot.on('inline_query', (query: any) => {
  // Start setup here
  const data = '0,0,0,1,000000000';
  const gameKeyboard = generateSetupKeyboard(parseGameData(data))

  const results = [
    {
      type: 'article',
      id: '1',
      title: 'Play',
      input_message_content: { message_text: 'This is game' },
      reply_markup: {
        inline_keyboard: gameKeyboard
      }
    }
  ];

  bot.answerInlineQuery(query.id, results, { cache_time: 0 });
});

function generateGameKeyboard(data: any) {
  console.log('generate game keyboard')
  const result = [];
  let counter = 0;
  for (let i = 0; i < 3; i++) {
    const row = [];
    for (let j = 0; j < 3; j++) {
      const gameData = parseGameData(data);
      const currentValue = gameData.game[counter];
      gameData.action = currentValue ? 0 : 3;
      gameData.game[counter] = gameData.game[counter] || gameData.tire;
      row.push({ text: decodeButtonText(currentValue), callback_data: stringifyGameData(gameData) })
      counter += 1;
      console.log({ gameData })
    }
    result.push(row);
  }
  return result;
}

function generateEndMessage(gameData: any) {
  let result = '';
  let counter = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const currentValue = gameData.game[counter];
      result += decodeStateText(currentValue)
      counter += 1;
    }
    result += '\n';
  }
  return result;
}

function decodeButtonText(num: number) {
  const BUTTON_TEXT = [' ', '❌', '⭕️'];
  return BUTTON_TEXT[num] || BUTTON_TEXT[0];
}

function decodeStateText(num: number) {
  const BUTTON_TEXT = ['⬜️', '❌', '⭕️'];
  return BUTTON_TEXT[num] || BUTTON_TEXT[0];
}

function parseGameData(str: string) {
  const arrData = str.split(',');
  return {
    action: +arrData[0],
    p1: +arrData[1],
    p2: +arrData[2],
    tire: +arrData[3],
    game: arrData[4].split('').map((n: string) => +n)
  }
}

function stringifyGameData(d: any) {
  return `${d.action},${d.p1},${d.p2},${d.tire},${d.game.map((n: number) => `${n}`).join('')}`
}

bot.on('polling_error', console.log)

function isWin(game: any) {
  const combinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  function isArrayElementsTheSame(arr: any) {
    return [...new Set(arr)].length == 1
  };

  for (let i = 0; i < combinations.length; i++) {
    const combination = combinations[i];
    const results = combination.map(index => game[index]);
    if (isArrayElementsTheSame(results)) {
      return results[0];
    }
  }
  return 0;
}

function generateSetupKeyboard(data: any) {
  const row = [];
  if (data.p1 === 0) {
    data.action = 1;
    row.push({ text: '❌', callback_data: stringifyGameData(data) })
  }
  if (data.p2 === 0) {
    data.action = 2;
    row.push({ text: '⭕️', callback_data: stringifyGameData(data) })
  }
  return [row];
}

// function create


function createKeyButton(text: string, data: string): InlineKeyboardButton {
  return { text, callback_data: data };
}


// 1 Setup keyboard
// 2 Game process
// 3 Results [win, standoff]

// 4 Instruction
// 5 Bot setup[image, name, description...]
// 6 Marketing[images, videos, ad]






