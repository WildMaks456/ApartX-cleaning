<script>
import axios from 'axios'
export default {
		name: "App",
		data() {
			return {
				showModalFlag: false,
				showModalFlag2: false,
				showModalFlag3: false,
				showModalFlag4: false,
				showModalFlag5: false,
				numCode: 0,
				textMail: "",
				numForCheck: null,
				selectedRole: "",
				RealUser: {},
				nameFromForm: "",
				numberFromForm: "",
				aboutFromForm: "",
				orders: [],
				statusFromForm: "",
				updatedStatus: "",
				status: "",
				nameFromForm2: "",
				users: [],
				nameFromForm3: "",
				priceFromForm: "",
				searchInput: "",
			}
		},
		methods: {
			lsCheck() {
				if (localStorage.getItem("real_user") === null) {
					return false
				} else {
					this.RealUser = JSON.parse(localStorage.getItem("real_user"))
					return true
				}
			},
			lsCheck2() {
				if (localStorage.getItem("real_user") === null) {
					this.RealUser = JSON.parse(localStorage.getItem("real_user"))
					return true
				} else {
					return false
				}
			},
			showModal() {
				this.showModalFlag = true;
			},
			closeModal() {
				this.showModalFlag = false;
				this.showModalFlag2 = false;
				this.showModalFlag3 = false;
				this.showModalFlag4 = false;
				this.showModalFlag5 = false;
			},
			getVerifNumber() {
				var min = 1000;
				var max = 9999;
				return Math.floor(Math.random() * (max - min + 1)) + min;
			},
			getCode() {
				if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.textMail) && this.selectedRole != "") {
					this.numCode = this.getVerifNumber()
					axios.post('http://localhost:4000/verification', {
						gmail: this.textMail,
						text: this.numCode
					})
					.catch(err => console.log(err))
					this.showModalFlag = false;
					this.showModalFlag2 = true;

				} else {
					alert("Введите правильный адрес электронной почты")
				}
				
			},
			checkCode() {
				if (+this.numForCheck === this.numCode) {
					axios.post('http://localhost:4000/dbwrite', {
						email: this.textMail,
						role: this.selectedRole
					})
					.then(res => {
						console.log(res);
					})
					.catch(err => {
						console.log(err);
					});
					localStorage.setItem("real_user", JSON.stringify({email: this.textMail, role: this.selectedRole}))
					this.textMail = ""
					this.selectedRole = ""
					this.numForCheck = null
					this.closeModal()
					console.log(this.lsCheck());
				} else {
					alert("Неправильный код")
				}
			},
			exitFromAcc() {
				localStorage.clear();
				window.location.reload();
			},
			checkExecuter() {
				if (localStorage.length != 0) {
					this.RealUser = JSON.parse(localStorage.getItem("real_user"))
					if (this.RealUser.role == "исполнитель") {
						return true
					} else {
						return false
					}
				} else {
					return false
				}
			},
			checkCustomer() {
				if (localStorage.length != 0) {
					this.RealUser = JSON.parse(localStorage.getItem("real_user"))
					if (this.RealUser.role == "заказчик") {
						return true
					} else {
						return false
					}
				} else {
					return false
				}
			},
			addInfoInTable() {
				this.showModalFlag3 = true;
			},
			saveContactInfo() {
				const email = this.RealUser.email;
				const name = this.nameFromForm;
				const number = this.numberFromForm;
				const about = this.aboutFromForm;

				axios.post('http://localhost:4000/saveContactInfo', {
					email,
					name,
					number,
					about
				})
				.then(res => {
					console.log(res);
					this.closeModal()
				})
				.catch(err => {
					console.log(err);
				});
			},
			getOrders() {
				axios.get('http://localhost:4000/orders')
				.then(res => {
					console.log(res.data);
					this.orders = res.data;
				})
				.catch(error => {
					console.log(error);
				});
			},
			statusUpdate() {
				this.RealUser = JSON.parse(localStorage.getItem("real_user"));

				axios.get('http://localhost:4000/getStatus', {
					params: {
						email: this.RealUser.email
					}
				})
					.then(response => {
						this.status = response.data.status;
						console.log(this.status);
						if (this.status === null) {
							this.updatedStatus = "Активный";
						} else if (this.status === "Активный") {
							this.updatedStatus = "Отключен";
						} else if (this.status === "Отключен") {
							this.updatedStatus = "Активный";
						}

						this.statusFromForm = this.updatedStatus;

						axios.post('http://localhost:4000/updateStatus', {
							email: this.RealUser.email,
							status: this.updatedStatus
						})
							.then(response => {
								console.log(response);
							})
							.catch(error => {
								console.log(error);
							});
					})
					.catch(error => {
						console.log(error);
					});
			},
			addNumberInTable() {
				this.showModalFlag4 = true;
			},
			saveContactInfo2() {
				const email = this.RealUser.email;
				const number = this.nameFromForm2;

				axios.post('http://localhost:4000/saveContactInfo2', {
					email,
					number
				})
				.then(res => {
					console.log(res);
					this.closeModal()
				})
				.catch(err => {
					console.log(err);
				});
			},
			getAllActiveUsers() {
				axios.get('http://localhost:4000/getAllActiveUsers')
				.then(response => {
					this.users = response.data
					console.log(this.users);
				})
				.catch(error => {
					console.log(error);
				});
			},
			addOrder() {
				this.showModalFlag5 = true;
			},
			saveOrder() {
				const email = this.RealUser.email;
				const nameoforder = this.nameFromForm3;
				const price = this.priceFromForm;
				axios.post("http://localhost:4000/saveOrder", {
						email,
						nameoforder,
						price
					})
					.then(res => {
						console.log(res);
						this.closeModal();
					})
					.catch(err => {
						console.log(err);
					});
			},
			renderActiveFindedUsers() {
				axios.get('http://localhost:4000/getAllActiveUsers')
				.then(response => {
					this.users = response.data.filter(user => {return user.about.toLowerCase().includes(this.searchInput.toLowerCase());});
					console.log(this.users);
				})
				.catch(error => {
					console.log(error);
				});
			},
			acceptOrder(nameoforder) {
				axios.post("http://localhost:4000/updateOrderStatus", {
					nameoforder: nameoforder,
					status: 'Принят'
				})
				.then(res => {
					console.log(res);
				})
				.catch(err => {
					console.log(err);
				});
			},
			offerJob(email) {
				axios.get('http://localhost:4000/getStatus', {
					params: {
						email: email
					}
				})
					.then(response => {
						this.status = response.data.status;
						console.log(this.status);
						if (this.status === "Активный") {
							axios.post('http://localhost:4000/updateStatus', {
								email: email,
								status: "Отключен"
							})
								.then(response => {
									console.log(response);
								})
								.catch(error => {
									console.log(error);
								});
						}
					})
					.catch(error => {
						console.log(error);
					});
					window.location.reload()
			}
		},
	}
</script>

<template>
	<header class="header">
		<img src="./images/logo_full.webp" alt="#">
		<div>
			<button v-if="lsCheck2()" class="btn" @click="showModal">Авторизация</button>
			<div class="div-lscheck" v-if="lsCheck()">
				<p class="head-p">{{ RealUser.email }}</p>
				<button class="btn" @click="exitFromAcc">Выход</button>
			</div>
		</div>
	</header>

	<div class="modal" v-if="showModalFlag">
		<div class="modal-content">
			<input type="text" class="inps" v-model="textMail" placeholder="Введите gmail">
			<div class="select-wrapper">
				<select class="select" v-model="selectedRole">
					<option value="" disabled selected>Выберите роль</option>
					<option value="исполнитель">Исполнитель</option>
					<option value="заказчик">Заказчик</option>
				</select>
			</div>
			<button class="btn" @click="getCode">Получить код</button>
			<button class="btn" @click="closeModal">Отмена</button>
		</div>
	</div>
	<div class="modal" v-if="showModalFlag2">
		<div class="modal-content">
			<input type="text" class="inps2" v-model="numForCheck" maxlength="4" placeholder="_ _ _ _">
			<button class="btn" @click="checkCode">Проверить</button>
			<button class="btn" @click="closeModal">Отмена</button>
		</div>
	</div>

	<main class="main">
		<div v-if="checkExecuter()" class="execute main2">
			<button class="btn" @click="addInfoInTable">Заполнить анкету</button>
			<div class="stat-div">
				<button class="btn" @click="statusUpdate">Изменить статус анкеты</button>
				<p>{{ statusFromForm }}</p>
			</div>
			<button class="btn" @click="getOrders">Доступные заказы</button>
		</div>
		<div v-if="checkExecuter()" class="orders main2">
			<div v-for="order in orders" class="orderForOrder" :key="order.id">
				<h2>{{ order.nameoforder }}</h2>
				<p>{{ "Цена: " + order.price }}</p>
				<p>{{ "Заказчик: " + order.nameofcustomer }}</p>
				<button class="btn" @click="acceptOrder(order.id)">Откликнуться</button>
			</div>
		</div>
		<div v-if="checkCustomer()" class="execute main3">
			<div class="main3-btns">
				<button class="btn" @click="addNumberInTable">Ввести номер телефона</button>
				<button class="btn" @click="getAllActiveUsers">Все доступные исполнители</button>
				<button class="btn" @click="addOrder">Разместить заказ</button>
			</div>
			<input type="text" v-model="searchInput" @input="renderActiveFindedUsers" class="inps" id="inp-main3">
		</div>
		<div v-if="checkCustomer()" class="orders main2">
			<div v-for="user in users" class="orderForOrder" :key="user.id">
				<h2>{{ user.name }}</h2>
				<p>{{ user.email }}</p>
				<p>{{ "+" + user.number }}</p>
				<p>{{ user.about }}</p>
				<button class="btn" @click="offerJob(user.email)">Предложить работу</button>
			</div>
		</div>
		<div class="modal" v-if="showModalFlag3">
			<div class="modal-content2">
				<input type="text" class="inps2" v-model="nameFromForm" placeholder="Имя исполнителя">
				<input type="text" class="inps2" v-model="numberFromForm" placeholder="Номер телефона">
				<input type="text" class="inps2" v-model="aboutFromForm" placeholder="Сфера деятельности - опыт">
				<button class="btn" @click="saveContactInfo">Сохранить</button>
				<button class="btn" @click="closeModal">Отмена</button>
			</div>
		</div>
		<div class="modal" v-if="showModalFlag4">
			<div class="modal-content2">
				<input type="text" class="inps2" v-model="nameFromForm2" placeholder="Номер телефона">
				<button class="btn" @click="saveContactInfo2">Сохранить</button>
				<button class="btn" @click="closeModal">Отмена</button>
			</div>
		</div>
		<div class="modal" v-if="showModalFlag5">
			<div class="modal-content2">
				<input type="text" class="inps2" v-model="nameFromForm3" placeholder="Описание услуги">
				<input type="number" class="inps2" v-model="priceFromForm" placeholder="Цена">
				<button class="btn" @click="saveOrder">Сохранить</button>
				<button class="btn" @click="closeModal">Отмена</button>
			</div>
		</div>
	</main>
</template>

<style>
	html, body {
		background-color: #fff;
		height: 100%;
	}
	#app {
		display: block;
		margin: 0;
		padding: 0;
		max-width: 1920px;
		width: 100%;
		height: 100%;
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 80%;
		margin: auto;
		padding: 20px 15px;
	}
	.main {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		width: 80%;
		margin: auto;
		padding: 20px 15px;
	}
	.main2 {
		display: flex;
		justify-content: space-around;
		align-items: center;
		width: 80%;
		margin: auto;
		padding: 70px 15px;
	}
	.main3 {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 80%;
		margin: auto;
		padding: 70px 15px;
	}
	#inp-main3 {
		margin-right: 0;
	}
	.main3-btns {
		display: flex;
		justify-content: center;
		gap: 20px;
		width: 100%;
		padding-bottom: 10px;
	}
	.stat-div {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
		flex-direction: column;
	}
	.stat-div p {
		color: #000;
		font-size: 18px;
	}
	.orderForOrder {
		border: 1px solid rgb(182, 182, 182);
		padding: 20px;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: center;
	}
	.orders {
		color: #000;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 20px;
	}
	.header img {
		width: 213px;
	}
	.btn {
		border: 5px solid #06c;
		background-color: #fff;
		font-size: 18px;
		padding: 10px 15px;
		border-radius: 30px;
		transition: .3s;
	}
	.btn:hover {
		background-color: #06c;
		color: #fff;
		cursor: pointer;
	}

	.select-wrapper {
		position: relative;
		display: inline-block;
		font-family: Arial, sans-serif;
	}

	.select {
		appearance: none;
		outline: none;
		border: none;
		background-color: #f5f5f5;
		padding: 10px;
		font-size: 16px;
		border-radius: 4px;
		width: 200px;
		cursor: pointer;
		text-align: center;
		border: 2px solid gray;

	}

	.select option {
		background-color: #fff;
		color: #333;
	}

	.select::after {
		content: '\25BE';
		position: absolute;
		top: 50%;
		right: 10px;
		transform: translateY(-50%);
		font-size: 14px;
		pointer-events: none;
	}

	.head-p {
		font-size: 18px;
		color: #000;
	}
	.div-lscheck {
		display: flex;
		gap: 15px;
		align-items: center;
	}

	.inps {
		padding: 10px 15px;
		width: 100%;
		font-size: 18px;
		border-radius: 10px;
		margin-right: 10px;
		outline: none;
		border: 2px solid #06c;
	}
	.inps2 {
		padding: 10px 15px;
		width: 100%;
		font-size: 18px;
		border-radius: 10px;
		margin-right: 10px;
		outline: none;
		border: 2px solid #06c;
		text-align: center;
	}


	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
	}
	.modal-content {
		display: flex;
		flex-wrap: wrap;
		flex-direction: column;
		gap: 10px;
		align-items: center;
		justify-content: center;
		background-color: white;
		padding: 20px;
		border-radius: 5px;
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.modal-content2 {
		display: flex;
		flex-wrap: wrap;
		flex-direction: column;
		gap: 10px;
		align-items: center;
		justify-content: center;
		background-color: white;
		padding: 20px;
		border-radius: 5px;
		display: flex;
		align-items: center;
		gap: 10px;
		width: 50%;
	}
</style>
