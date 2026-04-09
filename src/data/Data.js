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
				name: "Шаверма сырная",
				price: 300,
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
				name: "Наггетсы",
				price: 170,
				current_price: 170,
				category: "snacks",
				ingredients: [
					{ productName: "Курица", qty: 120 }
				],
				available: true,
				weight: "140г"
			},
			{
				id: 5,
				name: "Капучино",
				price: 190,
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
				current_price: 190,
				category: "drinks",
				ingredients: [
					{ productName: "Кофе", qty: 18 },
					{ productName: "Молоко", qty: 220 }
				],
				available: true,
				weight: "300мл"
			}
		];
		localStorage.setItem(KEYS.MENU, JSON.stringify(menu));
	}
	if (!localStorage.getItem(KEYS.STOCK)) {
		const stock = [
			{ productName: 'Кофе', quantity: 400 },
			{ productName: 'Молоко', quantity: 4000 },
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