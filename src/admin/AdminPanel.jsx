import { useState, useEffect } from 'react';
import { getData, setData, getAllOrders } from '../data/Data.js';
import './AdminPanel.css';

export const AdminPanel = () => {
	const [stock, setStock] = useState([]);
	const [orders, setOrders] = useState([]);
	const [activeTab, setActiveTab] = useState('stock'); // 'stock' или 'orders'

	useEffect(() => {
		loadStock();
		loadOrders();
	}, []);

	const loadStock = () => {
		const stockData = getData('stock');
		setStock(stockData);
	};

	const loadOrders = () => {
		const ordersData = getAllOrders();
		setOrders(ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
	};

	const getStockRowStatus = (item) => {
		const today = new Date();
		const expiryDate = new Date(item.expiry_date);
		const daysToExpire = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
		const percentLeft = (item.quantity / item.supply_quantity) * 100;

		// 🔴 Критично: истёк срок годности ИЛИ остаток меньше минимального процента
		if (daysToExpire < 0 || percentLeft <= item.min_percent) {
			return 'critical';
		}
		// 🟡 Внимание: срок годности 1-2 дня ИЛИ остаток близок к минимальному (min_percent + 10%)
		if (daysToExpire <= 2 || percentLeft <= item.min_percent + 10) {
			return 'warning';
		}
		// 🟢 Всё хорошо
		return 'normal';
	};

	const handleTestSupply = () => {
		const updated = stock.map(item => ({
			...item,
			quantity: Math.min(item.quantity + 500, item.supply_quantity)
		}));
		setData('stock', updated);
		setStock(updated);
		alert('✅ Тестовая поставка: +500 к остаткам (не более supply_quantity)');
	};

	const handleOutOfStock = () => {
		const updated = [...stock]; // создаём копию массива

		updated.forEach((item) => {
			if (item.productName === "Курица")
				item.quantity = 150;
			if (item.productName === "Соус")
				item.quantity = 30;
			if (item.productName === "Лаваш")
				item.quantity = 1;
		});

		setData('stock', updated);
		setStock(updated);
		alert('⚠️ Товары на исходе!');
	};

	const getStatusBadge = (status) => {
		const map = {
			'accepted': { text: 'Готовится', class: 'status-accepted' },
			'ready': { text: 'Готов к выдаче', class: 'status-ready' },
			'completed': { text: 'Выдан', class: 'status-completed' },
			'done': { text: 'Завершён пользователем', class: 'status-completed' },
			'cancelled': { text: 'Отменён', class: 'status-cancelled' }
		};
		const info = map[status] || { text: status, class: '' };
		return <span className={`status-badge ${info.class}`}>{info.text}</span>;
	};

	const formatDate = (iso) => {
		return new Date(iso).toLocaleString('ru-RU', {
			day: '2-digit', month: '2-digit', year: 'numeric',
			hour: '2-digit', minute: '2-digit'
		});
	};

	return (
		<div className="admin-panel">
			<div className="admin-header">
				<h2>Панель администратора</h2>
				<div className="admin-tabs">
					<button
						className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
						onClick={() => setActiveTab('stock')}
					>
						Сырьё
					</button>
					<button
						className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
						onClick={() => setActiveTab('orders')}
					>
						Заказы
					</button>
				</div>
			</div>

			{/* Вкладка СЫРЬЁ */}
			{activeTab === 'stock' && (
				<div className="stock-section">
					<div className="section-header">
						<h3>Склад сырья</h3>
						<div className="test-buttons">
							<button className="test-btn supply" onClick={handleTestSupply}>
								Тестовая поставка (+500)
							</button>
							<button className="test-btn danger" onClick={handleOutOfStock}>
								Обнулить остатки
							</button>
						</div>
					</div>

					<div className="table-wrapper">
						<table className="stock-table">
							<thead>
							<tr>
								<th>Продукт</th>
								<th>Текущее количество</th>
								<th>Срок годности</th>
								<th>Дата поставки</th>
								<th>Статус</th>
							</tr>
							</thead>
							<tbody>
							{stock.map(item => {
								const status = getStockRowStatus(item);
								const percentLeft = ((item.quantity / item.supply_quantity) * 100).toFixed(0);
								const today = new Date();
								const expiry = new Date(item.expiry_date);
								const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

								return (
									<tr key={item.supply_id} className={`row-${status}`}>
										<td className="product-name">{item.productName}</td>
										<td className="product-quantity">
											<strong>{item.quantity}</strong> / {item.supply_quantity}
											<span className="unit">
                          {item.productName.includes('Кофе') || item.productName.includes('Чай') ? 'г' :
							  item.productName.includes('Молоко') || item.productName.includes('Соус') ? 'мл' :
								  item.productName.includes('Лаваш') ? 'шт' : 'г'}
                        </span>
											<span className="percent-badge">({percentLeft}%)</span>
										</td>
										<td className={`expiry-cell ${daysLeft <= 2 ? 'warning' : ''} ${daysLeft < 0 ? 'expired' : ''}`}>
											{item.expiry_date}
											{daysLeft > 0 && <span className="days-info"> (через {daysLeft} дн.)</span>}
											{daysLeft === 0 && <span className="days-info"> (сегодня)</span>}
											{daysLeft < 0 && <span className="days-info expired"> (просрочен!)</span>}
										</td>
										<td>{item.delivery_date}</td>
										<td className="status-cell">
											{status === 'critical' && <span className="status-tag critical">🔴 Критично</span>}
											{status === 'warning' && <span className="status-tag warning">🟡 Внимание</span>}
											{status === 'normal' && <span className="status-tag normal">🟢 Норма</span>}
										</td>
									</tr>
								);
							})}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Вкладка ЗАКАЗЫ */}
			{activeTab === 'orders' && (
				<div className="orders-section">
					<h3>Все заказы ({orders.length})</h3>
					<div className="table-wrapper">
						<table className="orders-table">
							<thead>
							<tr>
								<th>ID</th>
								<th>Клиент</th>
								<th>Состав</th>
								<th>Сумма</th>
								<th>Оплата</th>
								<th>Статус</th>
								<th>Время</th>
							</tr>
							</thead>
							<tbody>
							{orders.map(order => (
								<tr key={order.id}>
									<td><strong>#{order.id}</strong></td>
									<td>ID: {order.user.name} {order.user.phone}</td>
									<td className="items-cell">
										{order.items.map((it, i) => (
											<div key={i}>{it.quantity}× {it.name}</div>
										))}
									</td>
									<td className="total-cell">{order.total} ₽</td>
									<td>
                      <span className={`payment-badge ${order.paymentMethod}`}>
                        {order.paymentMethod === 'card' ? '💳 Карта' : '📱 СБП'}
                      </span>
									</td>
									<td>{getStatusBadge(order.status)}</td>
									<td className="time-cell">{formatDate(order.createdAt)}</td>
								</tr>
							))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
};