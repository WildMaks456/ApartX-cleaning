"use strict";

var TelegramBot = require('node-telegram-bot-api');

var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('../ApartX.db'); // Подключение к базе данных SQLite

var token = '6139307018:AAGzGSHKBGCfWkIi0i4dm0vgIPHU9Lszstk'; // Замените на токен вашего бота

var bot = new TelegramBot(token, {
  polling: true
});
bot.onText(/\/start/, function (msg) {
  var chatId = msg.chat.id;
  var username = msg.from.username;
  bot.sendMessage(chatId, "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, ".concat(username, "! \u041D\u0430\u0448 \u0431\u043E\u0442 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0443\u043F\u0440\u043E\u0449\u0435\u043D\u043D\u043E\u0439 \u0432\u0435\u0440\u0441\u0438\u0435\u0439 \u043D\u0430\u0448\u0435\u0433\u043E \u0441\u0435\u0440\u0432\u0438\u0441\u0430, \u0437\u0434\u0435\u0441\u044C \u0432\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u0431\u044B\u0441\u0442\u0440\u043E \u043D\u0430\u0439\u0442\u0438 \u0441\u0435\u0431\u0435 \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044F"));
});
bot.onText(/\/check/, function (msg) {
  var chatId = msg.chat.id;
  db.serialize(function () {
    db.all("SELECT name, about, number, status FROM executers WHERE status = 'Активный'", function (err, rows) {
      if (err) {
        console.error(err);
        return;
      }

      if (rows.length > 0) {
        rows.forEach(function (row) {
          var name = row.name;
          var about = row.about;
          var number = row.number;
          bot.sendMessage(chatId, "\u0418\u043C\u044F \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044F: ".concat(name, ", \u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435: ").concat(about, ", \u041D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430: ").concat(number));
        });
      } else {
        bot.sendMessage(chatId, 'Нет записей с указанным статусом');
      }
    });
  });
});
bot.on('message', function (msg) {
  var chatId = msg.chat.id;

  if (msg = '1') {}
});
bot.on('polling_error', function (error) {
  console.log(error);
});
console.log('Telegram-бот запущен');