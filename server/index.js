require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const port = 4000;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('ApartX.db');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.post('/verification', (req, res) => {
	const { gmail, text } = req.body;
	sgMail.setApiKey(process.env.SENDGRID_API_KEY)
	const msg = {
		to: `${gmail}`, // Change to your recipient
		from: 'ikiselevps4@gmail.com', // Change to your verified sender
		subject: `${text}`,
		text: `${text}`,
		html: `<strong>${text}</strong>`,
	}
	sgMail.send(msg)
	.then(() => {
		console.log('Email sent')
	})
	.then(() => {
		res.send(JSON.stringify(`${gmail} - ${text}`));
	})
	.catch((error) => {
		console.error(error)
	})
});

app.post('/dbwrite', (req, res) => {
	const { email, role } = req.body;
	if (role === "исполнитель") {
		let selectQuery = `
			SELECT * FROM executers WHERE email = ?
		`;
		db.get(selectQuery, [email], function (err, row) {
			if (err) {
				console.error(err);
				res.status(500).send('Ошибка при выполнении запроса к базе данных');
			} else {
				if (row) {
					res.send('Пользователь с указанным email уже существует');
				} else {
					let insertQuery = `
						INSERT INTO executers (email)
						VALUES (?)
					`;
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
		let selectQuery = `
			SELECT * FROM customers WHERE email = ?
			`;
		db.get(selectQuery, [email], function (err, row) {
			if (err) {
				console.error(err);
				res.status(500).send('Ошибка при выполнении запроса к базе данных');
			} else {
				if (row) {
					res.send('Пользователь с указанным email уже существует');
				} else {
					let insertQuery = `
						INSERT INTO customers (email)
						VALUES (?)
					`;
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


app.delete('/deleteData', (req, res) => {
  const { email, role } = req.body;
  if (role === "исполнитель") {
    let deleteQuery = `
      DELETE FROM executers
      WHERE email = ?
    `;
    db.run(deleteQuery, [email], function (err) {
      if (err) {
        console.error(err);
        res.status(500).send('Ошибка при удалении данных из базы данных');
      } else {
        res.send('Данные успешно удалены из базы данных');
      }
    });
  } else if (role === "заказчик") {
    let deleteQuery = `
      DELETE FROM customers
      WHERE email = ?
    `;
    db.run(deleteQuery, [email], function (err) {
      if (err) {
        console.error(err);
        res.status(500).send('Ошибка при удалении данных из базы данных');
      } else {
        res.send('Данные успешно удалены из базы данных');
      }
    });
  }
});

app.post('/saveContactInfo', (req, res) => {
  const { email, name, number, about } = req.body;
  
  let updateQuery = `
    UPDATE executers
    SET name = ?, number = ?, about = ?
    WHERE email = ?
  `;
  db.run(updateQuery, [name, number, about, email], function (err) {
    if (err) {
      console.error(err);
      res.status(500).send('Ошибка при обновлении данных в базе данных');
    } else {
      res.send('Данные успешно обновлены в базе данных');
    }
  });
});

app.get('/getAllActiveUsers', (req, res) => {
  db.all('SELECT * FROM executers WHERE status = ?', ['Активный'], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Произошла ошибка при получении списка исполнителей');
    } else {
      res.json(rows);
    }
  });
});

app.post('/saveContactInfo2', (req, res) => {
  const { email, number } = req.body;
  
  let updateQuery2 = `
    UPDATE customers
    SET number = ?
    WHERE email = ?
  `;
  db.run(updateQuery2, [number, email], function (err) {
    if (err) {
      console.error(err);
      res.status(500).send('Ошибка при обновлении данных в базе данных');
    } else {
      res.send('Данные успешно обновлены в базе данных');
    }
  });
});

app.get('/orders', (req, res) => {
  let selectQuery = `
    SELECT * FROM orders WHERE status IS NULL
  `;
  db.all(selectQuery, function (err, rows) {
    if (err) {
      console.error(err);
      res.status(500).send('Ошибка при выполнении запроса к базе данных');
    } else {
      res.send(rows);
    }
  });
});

app.get('/getStatus', (req, res) => {
  const email = req.query.email;
  db.get('SELECT status FROM executers WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.json({ status: row ? row.status : null });
    }
  });
});

app.post('/updateStatus', (req, res) => {
  const email = req.body.email;
  const status = req.body.status;
  db.run('UPDATE executers SET status = ? WHERE email = ?', [status, email], function(err) {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

app.post("/saveOrder", (req, res) => {
  const { email, nameoforder, price } = req.body;
  db.run("INSERT INTO orders (nameoforder, nameofcustomer, price) VALUES (?, ?, ?)", [nameoforder, email, price], (err, result) => {
    if (err) {
      console.error("Ошибка выполнения запроса:", err);
      res.sendStatus(500);
      return;
    }
    console.log("Заказ успешно сохранен в базе данных");
    res.sendStatus(200);
  });
});

app.post('/updateOrderStatus', (req, res) => {
  const { nameoforder, status} = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, nameoforder], (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send('Произошла ошибка при обновлении статуса заказа');
    } else {
      res.send('Статус заказа успешно обновлен');
    }
  });
});

app.use(function(req, res){
	res.status(404).send("<h1>404</h1>")
})

app.listen(port, () => {
	console.log("Server started");
	console.log("Click CTRL + C to exit");
})