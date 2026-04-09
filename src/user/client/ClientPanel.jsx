import { useState, useEffect } from 'react';
import {MenuView} from "./MenuView/MenuView.jsx";
import {getStatusText, OrderStatusView} from "./OrderStatusView/OrderStatusView.jsx";
import {
	getData,
	isMenuItemAvailable,
	consumeIngredients,
	createOrder,
	getCurrentUser,
	updateOrderStatus
} from '../../data/Data.js';
import './ClientPanel.css'


export const ClientPanel = ({ user }) => {
	const [menu, setMenu] = useState([]);
	const [cart, setCart] = useState([]);
	const [currentView, setCurrentView] = useState('menu'); // 'menu' или 'status'
	const [currentOrder, setCurrentOrder] = useState(null);
	const [activeOrderNotification, setActiveOrderNotification] = useState(null);

	const checkActiveOrders = () => {
		const orders = getData('orders');
		const currentUser = getCurrentUser();

		if (!currentUser) return;

		// ищем заказ пользователя
		const activeOrders = orders.filter(order =>
			order.user.phone === currentUser.phone && order.status !== "done"
		);

		if (activeOrders.length > 0) {
			// Берём самый свежий активный заказ
			const latestOrder = activeOrders.sort((a, b) =>
				new Date(b.createdAt) - new Date(a.createdAt)
			)[0];
			setActiveOrderNotification(latestOrder);
		}
	};

	const handleGoToOrder = () => {
		setCurrentOrder(activeOrderNotification);
		setCurrentView('status');
		setActiveOrderNotification(null); // Скрываем уведомление
	};

	const loadMenu = () => {
		const menuData = getData('menu');
		setMenu(menuData);
	};

	useEffect(() => {
		loadMenu();
		checkActiveOrders();
	}, []);



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
		const order = createOrder(user, cart, total);

		// Очищаем корзину и переключаемся на отслеживание
		setCart([]);
		setCurrentOrder(order);
		setCurrentView('status');
	};

	const handleBackToMenu = () => {
		setCurrentView('menu');
		checkActiveOrders();
		setCurrentOrder(null);
	};

	function handleDismissNotification() {
		updateOrderStatus(activeOrderNotification.id, 'done');
		setActiveOrderNotification(null);
	}
	return (
		<div className="client-panel">
			{/* Уведомление об активном заказе */}
			{activeOrderNotification && currentView === 'menu' && (
				<div className="active-order-notification">
					<div className="notification-content">
						<div className="notification-icon">🍽️</div>
						<div className="notification-text">
							<strong>У вас есть активный заказ</strong>
							<p>Заказ {activeOrderNotification.user.name} — {getStatusText(activeOrderNotification.status)}</p>
						</div>
					</div>
					<div className="notification-actions">
						<button className="notification-btn primary" onClick={handleGoToOrder}>
							Отслеживать
						</button>
						{activeOrderNotification.status === "cancelled" || activeOrderNotification.status === "completed" && (
							<button className="notification-btn secondary" onClick={handleDismissNotification}>
								✕
							</button>
						)}

					</div>
				</div>
			)}
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