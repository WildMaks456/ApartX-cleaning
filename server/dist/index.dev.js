"use strict";

require('dotenv').config();

var express = require('express');

var bodyParser = require('body-parser');

var sgMail = require('@sendgrid/mail');

var cors = require('cors');

var port = 4000;

var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('ApartX.db');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors());
app.post('/verification', function (req, res) {
  var _req$body = req.body,
      gmail = _req$body.gmail,
      text = _req$body.text;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  var msg = {
    to: "".concat(gmail),
    // Change to your recipient
    from: 'ikiselevps4@gmail.com',
    // Change to your verified sender
    subject: "".concat(text),
    text: "".concat(text),
    html: "<strong>".concat(text, "</strong>")
  };
  sgMail.send(msg).then(function () {
    console.log('Email sent');
  }).then(function () {
    res.send(JSON.stringify("".concat(gmail, " - ").concat(text)));
  })["catch"](function (error) {
    console.error(error);
  });
});
app.post('/dbwrite', function (req, res) {
  var _req$body2 = req.body,
      email = _req$body2.email,
      role = _req$body2.role;

  if (role === "исполнитель") {
    var selectQuery = "\n\t\t\tSELECT * FROM executers WHERE email = ?\n\t\t";
    db.get(selectQuery, [email], function (err, row) {
      if (err) {
        console.error(err);
        res.status(500).send('Ошибка при выполнении запроса к базе данных');
      } else {
        if (row) {
          res.send('Пользователь с указанным email уже существует');
        } else {
          var insertQuery = "\n\t\t\t\t\t\tINSERT INTO executers (email)\n\t\t\t\t\t\tVALUES (?)\n\t\t\t\t\t";
          db.run(insertQuery, [email], function (err) {
            if (err) {
              console.error(err);
              res.status(500).send('Ошибка при сохранении данных в базу данных');
            } else {
              res.send('Данные успешно сохранены в базе данных');
            }
          });
        }
      }
    });
  } else if (role === "заказчик") {
    var _selectQuery = "\n\t\t\tSELECT * FROM customers WHERE email = ?\n\t\t\t";
    db.get(_selectQuery, [email], function (err, row) {
      if (err) {
        console.error(err);
        res.status(500).send('Ошибка при выполнении запроса к базе данных');
      } else {
        if (row) {
          res.send('Пользователь с указанным email уже существует');
        } else {
          var insertQuery = "\n\t\t\t\t\t\tINSERT INTO customers (email)\n\t\t\t\t\t\tVALUES (?)\n\t\t\t\t\t";
          db.run(insertQuery, [email], function (err) {
            if (err) {
              console.error(err);
              res.status(500).send('Ошибка при сохранении данных в базу данных');
            } else {
              res.send('Данные успешно сохранены в базе данных');
            }
          });
        }
      }
    });
  }
});
app["delete"]('/deleteData', function (req, res) {
  var _req$body3 = req.body,
      email = _req$body3.email,
      role = _req$body3.role;

  if (role === "исполнитель") {
    var deleteQuery = "\n      DELETE FROM executers\n      WHERE email = ?\n    ";
    db.run(deleteQuery, [email], function (err) {
      if (err) {
        console.error(err);
        res.status(500).send('Ошибка при удалении данных из базы данных');
      } else {
        res.send('Данные успешно удалены из базы данных');
      }
    });
  } else if (role === "заказчик") {
    var _deleteQuery = "\n      DELETE FROM customers\n      WHERE email = ?\n    ";
    db.run(_deleteQuery, [email], function (err) {
      if (err) {
        console.error(err);
        res.status(500).send('Ошибка при удалении данных из базы данных');
      } else {
        res.send('Данные успешно удалены из базы данных');
      }
    });
  }
});
app.post('/saveContactInfo', function (req, res) {
  var _req$body4 = req.body,
      email = _req$body4.email,
      name = _req$body4.name,
      number = _req$body4.number,
      about = _req$body4.about;
  var updateQuery = "\n    UPDATE executers\n    SET name = ?, number = ?, about = ?\n    WHERE email = ?\n  ";
  db.run(updateQuery, [name, number, about, email], function (err) {
    if (err) {
      console.error(err);
      res.status(500).send('Ошибка при обновлении данных в базе данных');
    } else {
      res.send('Данные успешно обновлены в базе данных');
    }
  });
});
app.get('/getAllActiveUsers', function (req, res) {
  db.all('SELECT * FROM executers WHERE status = ?', ['Активный'], function (err, rows) {
    if (err) {
      console.error(err);
      res.status(500).send('Произошла ошибка при получении списка исполнителей');
    } else {
      res.json(rows);
    }
  });
});
app.post('/saveContactInfo2', function (req, res) {
  var _req$body5 = req.body,
      email = _req$body5.email,
      number = _req$body5.number;
  var updateQuery2 = "\n    UPDATE customers\n    SET number = ?\n    WHERE email = ?\n  ";
  db.run(updateQuery2, [number, email], function (err) {
    if (err) {
      console.error(err);
      res.status(500).send('Ошибка при обновлении данных в базе данных');
    } else {
      res.send('Данные успешно обновлены в базе данных');
    }
  });
});
app.get('/orders', function (req, res) {
  var selectQuery = "\n    SELECT * FROM orders WHERE status IS NULL\n  ";
  db.all(selectQuery, function (err, rows) {
    if (err) {
      console.error(err);
      res.status(500).send('Ошибка при выполнении запроса к базе данных');
    } else {
      res.send(rows);
    }
  });
});
app.get('/getStatus', function (req, res) {
  var email = req.query.email;
  db.get('SELECT status FROM executers WHERE email = ?', [email], function (err, row) {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.json({
        status: row ? row.status : null
      });
    }
  });
});
app.post('/updateStatus', function (req, res) {
  var email = req.body.email;
  var status = req.body.status;
  db.run('UPDATE executers SET status = ? WHERE email = ?', [status, email], function (err) {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});
app.post("/saveOrder", function (req, res) {
  var _req$body6 = req.body,
      email = _req$body6.email,
      nameoforder = _req$body6.nameoforder,
      price = _req$body6.price;
  db.run("INSERT INTO orders (nameoforder, nameofcustomer, price) VALUES (?, ?, ?)", [nameoforder, email, price], function (err, result) {
    if (err) {
      console.error("Ошибка выполнения запроса:", err);
      res.sendStatus(500);
      return;
    }

    console.log("Заказ успешно сохранен в базе данных");
    res.sendStatus(200);
  });
});
app.post('/updateOrderStatus', function (req, res) {
  var _req$body7 = req.body,
      nameoforder = _req$body7.nameoforder,
      status = _req$body7.status;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, nameoforder], function (error, results, fields) {
    if (error) {
      console.error(error);
      res.status(500).send('Произошла ошибка при обновлении статуса заказа');
    } else {
      res.send('Статус заказа успешно обновлен');
    }
  });
});
app.use(function (req, res) {
  res.status(404).send("<h1>404</h1>");
});
app.listen(port, function () {
  console.log("Server started");
  console.log("Click CTRL + C to exit");
});