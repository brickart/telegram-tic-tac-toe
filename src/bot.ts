const TelegramBot = require('node-telegram-bot-api');
import { InlineKeyboardButton, InlineQueryResultArticle } from 'node-telegram-bot-api';

import { TOKEN, URL, isDevMode } from './config';
import { GAME_NAME_MESSAGE, X_FIGURE, O_FIGURE } from './data';
import { Game } from './game';

const bot = new TelegramBot(TOKEN);
if (isDevMode) {
  bot.setWebHook(URL);
}

export { bot };

bot.on('polling_error', console.log)

bot.on('message', (msg: any) => {
  // TODO: Make instructions!
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Received your message');
});

bot.on('inline_query', (query: any) => {
  // Start setup here
  const game = new Game();
  const keyboard = generateSetupKeyboard(game);

  const results: InlineQueryResultArticle[] = [
    {
      type: 'article',
      id: '1',
      title: 'Play',
      input_message_content: { message_text: createSetupMessage() },
      reply_markup: { inline_keyboard: keyboard }
    }
  ];

  bot.answerInlineQuery(query.id, results, { cache_time: 0 });
});

bot.on('callback_query', (query: any) => {
  const { inline_message_id, data } = query;
  const game = Game.fromString(data);

  if (game.tire === 1 && game.p1 !== query.from.id) return;
  if (game.tire === 2 && game.p2 !== query.from.id) return;

  switch (game.action) {
    case 0:
      return; 
    case 1:
      game.setPlayer1(query.from.id);
      break;
    case 2:
      game.setPlayer2(query.from.id);
      break;
    default:
      break;
  }


  let msg = '';
  let keyboard: InlineKeyboardButton[][] = [];
  if (!game.isReady()) {
    msg = createSetupMessage();
    keyboard = generateSetupKeyboard(game);
  } else if (!game.isWin()) {
    game.setTire();
    msg = createGameMessage(game.tire);
    keyboard = generateGameKeyboard(game);
  } else {
    msg = createWinnerMessage(query.from.first_name, query.from.last_name, game.desk );
  }

  try {
    bot.editMessageText(msg, {
      inline_message_id,
      reply_markup: { inline_keyboard: keyboard }
    })
  } catch (error) {
    console.log('Error: ', error);
  }
  
});

function generateGameKeyboard(game: Game) {
  const result = [];
  let counter = 0;
  for (let i = 0; i < 3; i++) {
    const row = [];
    for (let j = 0; j < 3; j++) {
      const data = game.generateDataFoNextTireByButtonIndex(counter)
      row.push(createKeyButton(decodeButtonText(game.desk[counter]), data))
      counter += 1;
    }
    result.push(row);
  }
  return result;
}

function generateEndMessage(desk: number[]) {
  let result = '';
  let counter = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const currentValue = desk[counter];
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

function generateSetupKeyboard(game: Game): InlineKeyboardButton[][] {
  const row = [];
  if (game.p1 === 0) {
    game.action = 1;
    row.push(createKeyButton(X_FIGURE, game.toString()));
  }
  if (game.p2 === 0) {
    game.action = 2;
    row.push(createKeyButton(O_FIGURE, game.toString()));
  }
  return [row];
}

// function creat

function createSetupMessage(): string {
  return `${GAME_NAME_MESSAGE}\n\nPlease choose your symbol`;
}

function createGameMessage(tire: number): string {
  return `${GAME_NAME_MESSAGE}\n\nPlayer turn ${decodeButtonText(tire)}`;
}

function createWinnerMessage(first_name: string = '', last_name: string = '', desk: number[]): string {
  return `${GAME_NAME_MESSAGE}\n\nCongratulations! 🎉🎉🎉\nA winner is ${first_name} ${last_name || ''}\n${generateEndMessage(desk)}`;
}

function createKeyButton(text: string, data: string): InlineKeyboardButton {
  return { text, callback_data: data };
}

// 1 Setup keyboard
// 2 Game process
// 3 Results [win, standoff]

// 4 Instruction
// 5 Bot setup[image, name, description...]
// 6 Marketing[images, videos, ad]
