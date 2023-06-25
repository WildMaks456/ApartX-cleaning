const TelegramBot = require('node-telegram-bot-api');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('../ApartX.db'); // Подключение к базе данных SQLite


const token = '6139307018:AAGzGSHKBGCfWkIi0i4dm0vgIPHU9Lszstk'; // Замените на токен вашего бота
const bot = new TelegramBot(token, {polling: true});





bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    
    bot.sendMessage(chatId, `Здравствуйте, ${username}! Наш бот является упрощенной версией нашего сервиса, здесь вы можете быстро найти себе исполнителя`);
  });

  bot.onText(/\/check/, (msg) => {
    const chatId = msg.chat.id;
  
    db.serialize(() => {
      db.all("SELECT name, about, number, status FROM executers WHERE status = 'Активный'", (err, rows) => {
        if (err) {
          console.error(err);
          return;
        }
        if (rows.length > 0) {
          rows.forEach((row) => {
            const name = row.name;
            const about = row.about;
            const number = row.number;
            bot.sendMessage(chatId, `Имя исполнителя: ${name}, Описание: ${about}, Номер телефона: ${number}`);
          });
        } else {
          bot.sendMessage(chatId, 'Нет записей с указанным статусом');
        }
      });
    });
  });

  
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if(msg='1'){
    }
    
  });

  bot.on('polling_error', (error) => {
    console.log(error);
  });
  
  console.log('Telegram-бот запущен');