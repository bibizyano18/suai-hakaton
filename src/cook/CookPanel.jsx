import { useState, useEffect } from 'react';
import { getOrdersByStatus, updateOrderStatus } from '../data/Data.js';
import './CookPanel.css';

export const CookPanel = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);

	const loadOrders = () => {
		const acceptedOrders = getOrdersByStatus('accepted');
		setOrders(acceptedOrders);
	};

	useEffect(() => {
		loadOrders();
		// Автообновление каждые 5 секунд
		const interval = setInterval(loadOrders, 5000);
		return () => clearInterval(interval);
	}, []);

	const handleMarkReady = (orderId) => {
		setLoading(true);
		updateOrderStatus(orderId, 'ready');
		loadOrders();
		setLoading(false);
	};

	const formatTime = (isoString) => {
		const date = new Date(isoString);
		const now = new Date();
		const diffMinutes = Math.floor((now - date) / 60000);

		if (diffMinutes < 1) return 'Только что';
		if (diffMinutes < 60) return `${diffMinutes} мин назад`;

		return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
	};

	if (orders.length === 0) {
		return (
			<div className="cook-panel">
				<div className="cook-header">
					<h2>👨‍🍳 Табло повара</h2>
				</div>
				<div className="empty-queue">
					<div className="empty-icon">🍽️</div>
					<h3>Очередь заказов пуста</h3>
					<p>Новых заказов пока нет</p>
				</div>
			</div>
		);
	}

	return (
		<div className="cook-panel">
			<div className="cook-header">
				<h1>Заказы</h1>
				<div className="queue-stats">
					<span className="queue-count">{orders.length} в очереди</span>
				</div>
			</div>

			<div className="orders-queue">
				{orders.map((order, index) => (
					<div key={order.id} className="cook-order-card">
						<div className="order-header">
							<div className="order-number">
								<span className="order-id">Заказ # {order.id} + {order.user.name}</span>
								<span className="order-time">{formatTime(order.createdAt)}</span>
							</div>
							<div className="order-position">
								{index === 0 && <span className="badge new">Приоритетный</span>}
								{index > 0 && <span className="badge waiting">Ожидает</span>}
							</div>
						</div>

						<div className="order-body">
							<div className="items-list">
								{order.items.map((item, idx) => (
									<div key={idx} className="cook-item">
										<div className="item-info">
											<span className="item-name">{item.name}</span>
										</div>
										{(
											<span className="item-total">
                        {item.quantity} шт.
                      </span>
										)}
									</div>
								))}
							</div>
						</div>

						<div className="order-footer">
							<button
								className="ready-btn"
								onClick={() => handleMarkReady(order.id)}
								disabled={loading}
							>
								<span className="btn-icon">✅</span>
								Заказ готов
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};