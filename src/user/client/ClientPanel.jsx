import { useState, useEffect } from 'react';
import {MenuView} from "./MenuView/MenuView.jsx";
import {OrderStatusView} from "./OrderStatusView/OrderStatusView.jsx";
import { getData, isMenuItemAvailable, consumeIngredients, createOrder } from '../../data/Data.js';
import './ClientPanel.css'



export const ClientPanel = ({ user }) => {
	const [menu, setMenu] = useState([]);
	const [cart, setCart] = useState([]);
	const [currentView, setCurrentView] = useState('menu'); // 'menu' или 'status'
	const [currentOrder, setCurrentOrder] = useState(null);

	useEffect(() => {
		loadMenu();
	}, []);

	const loadMenu = () => {
		const menuData = getData('menu');
		setMenu(menuData);
	};

	const addToCart = (menuItem) => {
		const existing = cart.find(item => item.menuId === menuItem.id);
		if (existing) {
			setCart(cart.map(item =>
				item.menuId === menuItem.id
					? { ...item, qty: item.qty + 1 }
					: item
			));
		} else {
			setCart([...cart, { menuId: menuItem.id, qty: 1 }]);
		}
	};

	const removeFromCart = (menuId) => {
		setCart(cart.filter(item => item.menuId !== menuId));
	};

	const updateQty = (menuId, delta) => {
		setCart(cart.map(item => {
			if (item.menuId === menuId) {
				const newQty = item.qty + delta;
				return newQty > 0 ? { ...item, qty: newQty } : item;
			}
			return item;
		}).filter(item => item.qty > 0));
	};

	const getTotal = () => {
		return cart.reduce((sum, item) => {
			const menuItem = menu.find(m => m.id === item.menuId);
			return sum + (menuItem?.price || 0) * item.qty;
		}, 0);
	};

	const handleCheckout = () => {
		// Проверяем доступность всех блюд в корзине
		for (let item of cart) {
			const menuItem = menu.find(m => m.id === item.menuId);
			if (!isMenuItemAvailable(menuItem)) {
				alert(`Блюдо "${menuItem.name}" сейчас недоступно и будет удалено из корзины`);
				return;
			}
		}

		// Списываем ингредиенты
		const result = consumeIngredients(cart);
		if (!result.success) {
			alert(`Невозможно оформить заказ: ${result.message}`);
			return;
		}

		// Создаём заказ
		const total = getTotal();
		const order = createOrder(user.phone, cart, total);

		// Очищаем корзину и переключаемся на отслеживание
		setCart([]);
		setCurrentOrder(order);
		setCurrentView('status');
	};

	const handleBackToMenu = () => {
		setCurrentView('menu');
		setCurrentOrder(null);
	};

	return (
		<div className="client-panel">
			{currentView === 'menu' ? (
				<MenuView
					menu={menu}
					cart={cart}
					onAddToCart={addToCart}
					onRemoveFromCart={removeFromCart}
					onUpdateQty={updateQty}
					onCheckout={handleCheckout}
					getTotal={getTotal}
				/>
			) : (
				<OrderStatusView
					order={currentOrder}
					onBackToMenu={handleBackToMenu}
				/>
			)}
		</div>
	);
};