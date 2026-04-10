import shawermaImg from '../assets/pita-stuffed-with-chicken-peppers 1-3.png'
import shawermaImg2 from '../assets/pita-stuffed-with-chicken-peppers 1-2.png'
import potatos from '../assets/potatos.png'
// import shawermaImg1 from '../assets/shawer-stuff-1.png'
const KEYS = {
	USERS: 'users',
	MENU: 'menu',
	STOCK: 'stock',
	ORDERS: 'orders',
	CURRENT_USER: 'currentUser', // { id, phone }
};

export const initData = () => {
	if (!localStorage.getItem(KEYS.MENU)) {
		const menu = [
			{
				id: 1,
				name: "Шаверма классическая",
				price: 260,
				src: shawermaImg,
				current_price: 260,
				category: "shawerma",
				ingredients: [
					{ productName: "Курица", qty: 150 },
					{ productName: "Лаваш", qty: 1 },
					{ productName: "Соус", qty: 30 }
				],
				available: true,
				weight: "320г"
			},
			{
				id: 2,
				name: "Шаверма двойная",
				price: 390,
				src: shawermaImg2,
				current_price: 390,
				category: "shawerma",
				ingredients: [
					{ productName: "Курица", qty: 150 },
					{ productName: "Лаваш", qty: 1 },
					{ productName: "Соус", qty: 30 }
				],
				available: true,
				weight: "510г"
			},
			{
				id: 2,
				name: "Шаверма сырная",
				price: 300,
				src: shawermaImg,
				current_price: 290,
				category: "shawerma",
				ingredients: [
					{ productName: "Курица", qty: 150 },
					{ productName: "Лаваш", qty: 1 },
					{ productName: "Сыр", qty: 40 },
					{ productName: "Соус", qty: 30 }
				],
				available: true,
				weight: "340г"
			},
			{
				id: 7,
				name: "Шаверма BBQ",
				price: 310,
				src: shawermaImg2,
				current_price: 295,
				ingredients: [
					{ productName: "Курица", qty: 150 },
					{ productName: "Соус", qty: 30 },
					{ productName: "Лаваш", qty: 1 },
					{ productName: "Бекон", qty: 5 }
				],
				available: true,
				weight: "340г"
			},
			{
				id: 3,
				name: "Картофель фри",
				price: 150,
				src: shawermaImg,
				current_price: 150,
				category: "snacks",
				ingredients: [
					{ productName: "Картофель", qty: 120 }
				],
				available: true,
				weight: "130г"
			},
			{
				id: 4,
				name: "Картофель фри XL",
				price: 310,
				src: potatos,
				current_price: 170,
				category: "snacks",
				ingredients: [
					{ productName: "Картофель", qty: 210 }
				],
				available: true,
				weight: "140г"
			},
			{
				id: 5,
				name: "Капучино",
				price: 190,
				src: shawermaImg,
				current_price: 175,
				category: "drinks",
				ingredients: [
					{ productName: "Кофе", qty: 18 },
					{ productName: "Молоко", qty: 180 }
				],
				available: true,
				weight: "250мл"
			},
			{
				id: 6,
				name: "Латте",
				price: 210,
				src: shawermaImg,
				current_price: 190,
				category: "drinks",
				ingredients: [
					{ productName: "Кофе", qty: 18 },
					{ productName: "Молоко", qty: 220 },
					{productName: "Сливки", qty: 80 }
				],
				available: true,
				weight: "300мл"
			}
		];
		localStorage.setItem(KEYS.MENU, JSON.stringify(menu));
	}
	// Инициализация склада с полной структурой
	if (!localStorage.getItem(KEYS.STOCK)) {
		const stock = [
			{
				supply_id: 1,
				productName: "Курица",
				supply_quantity: 10000,
				quantity: 1500,
				delivery_date: "2026-04-08",
				expiry_date: "2026-04-10",
				min_percent: 15
			},
			{
				supply_id: 2,
				productName: "Лаваш",
				supply_quantity: 300,
				quantity: 60,
				delivery_date: "2026-04-07",
				expiry_date: "2026-04-12",
				min_percent: 20
			},
			{
				supply_id: 3,
				productName: "Сырный лаваш",
				supply_quantity: 150,
				quantity: 20,
				delivery_date: "2026-04-07",
				expiry_date: "2026-04-11",
				min_percent: 20
			},
			{
				supply_id: 4,
				productName: "Кофе",
				supply_quantity: 2000,
				quantity: 200,
				delivery_date: "2026-04-08",
				expiry_date: "2026-04-10",
				min_percent: 15
			},
			{
				supply_id: 5,
				productName: "Соус",
				supply_quantity: 3000,
				quantity: 800,
				delivery_date: "2026-04-06",
				expiry_date: "2026-04-18",
				min_percent: 15
			},
			{
				supply_id: 6,
				productName: "Молоко",
				supply_quantity: 2000,
				quantity: 500,
				delivery_date: "2026-04-06",
				expiry_date: "2026-04-18",
				min_percent: 15
			},
			{
				supply_id: 7,
				productName: "Сыр",
				supply_quantity: 2000,
				quantity: 500,
				delivery_date: "2026-04-06",
				expiry_date: "2026-04-18",
				min_percent: 15
			}
		];
		localStorage.setItem(KEYS.STOCK, JSON.stringify(stock));
	}
	if (!localStorage.getItem(KEYS.ORDERS)) {
		localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
	}
	if (!localStorage.getItem(KEYS.USERS)) {
		localStorage.setItem(KEYS.USERS, JSON.stringify([]));
	}
};

export const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
export const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// авторизация
export const loginOrRegister = (phone, name) => {

	const users = getData(KEYS.USERS) || [];
	let user = users.find(u => u.phone === phone);
	if (!user) {
		user = {phone: phone, name: "Гость" };
		users.push(user);
		if (name)
			user.name = name;
		setData(KEYS.USERS, users);
	}
	setData(KEYS.CURRENT_USER, user);
	return user;
};

export const getCurrentUser = () => {
	return JSON.parse(localStorage.getItem(KEYS.CURRENT_USER));
};

export const logout = () => {
	localStorage.removeItem(KEYS.CURRENT_USER);
};

// Проверка доступности блюда (хватает ли ингредиентов)
export const isMenuItemAvailable = (menuItem) => {
	const stock = getData(KEYS.STOCK);
	for (let ing of menuItem.ingredients) {
		const stockItem = stock.find(s => s.productName === ing.productName);
		if (!stockItem || stockItem.quantity < ing.qty) return false;
	}
	return true;
};

// Списание ингредиентов для заказа
export const consumeIngredients = (orderItems) => {
	const stock = getData(KEYS.STOCK);
	const menu = getData(KEYS.MENU);

	// Собираем общее требуемое количество по каждому продукту
	const required = {};
	orderItems.forEach(item => {
		const menuItem = menu.find(m => m.id === item.menuId);
		menuItem.ingredients.forEach(ing => {
			required[ing.productName] = (required[ing.productName] || 0) + ing.qty * item.qty;
		});
	});

	// Проверяем хватает ли
	for (let product in required) {
		const stockItem = stock.find(s => s.productName === product);
		if (!stockItem || stockItem.quantity < required[product]) {
			return { success: false, message: `Недостаточно ${product}` };
		}
	}

	// Списываем
	for (let product in required) {
		const stockItem = stock.find(s => s.productName === product);
		stockItem.quantity -= required[product];
	}
	setData(KEYS.STOCK, stock);
	return { success: true };
};

// Создание заказа
export const createOrder = (user, cartItems, total) => {
	const menu = getData(KEYS.MENU);
	// Формируем items с названиями и ценами для истории
	const items = cartItems.map(item => {
		const menuItem = menu.find(m => m.id === item.menuId);
		return {
			menuId: item.menuId,
			name: menuItem.name,
			quantity: item.qty,
			price: menuItem.price,
		};
	});

	const orders = getData(KEYS.ORDERS);
	const newOrder = {
		id: Date.now(),
		user,
		status: 'accepted', // готовится
		items,
		total,
		createdAt: new Date().toISOString(),
	};
	orders.push(newOrder);
	setData(KEYS.ORDERS, orders);
	return newOrder;
};

// Обновление статуса заказа
export const updateOrderStatus = (orderId, status) => {
	const orders = getData(KEYS.ORDERS);
	const order = orders.find(o => o.id === orderId);
	if (order) {
		order.status = status;
		setData(KEYS.ORDERS, orders);
	}
	return order;
};
export const updateOrderDate = (orderId, date = new Date().toISOString()) => {
	const orders = getData(KEYS.ORDERS);
	const order = orders.find(o => o.id === orderId);
	if (order) {
		order.createdAt = date;
		setData(KEYS.ORDERS, orders);
	}
	return order;
}

// Получение заказов по статусу
export const getOrdersByStatus = (status) => {
	const orders = getData(KEYS.ORDERS);
	return orders.filter(o => o.status === status).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

// Получение всех заказов
export const getAllOrders = () => getData(KEYS.ORDERS);

// Обновление остатка продукта (админ)
export const updateStockQuantity = (productName, newQuantity) => {
	const stock = getData(KEYS.STOCK);
	const item = stock.find(s => s.productName === productName);
	if (item) {
		item.quantity = newQuantity;
		setData(KEYS.STOCK, stock);
	}
};