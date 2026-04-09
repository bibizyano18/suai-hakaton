import { useState, useEffect } from 'react';
import {
	getOrdersByStatus,
	updateOrderStatus,
	consumeIngredients,
	updateOrderDate
} from '../data/Data.js';
import './QualityPanel.css';

export const QualityPanel = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [problemItems, setProblemItems] = useState({}); // { orderId: [itemIndexes] }

	const loadOrders = () => {
		const readyOrders = getOrdersByStatus('ready');
		setOrders(readyOrders);
	};

	useEffect(() => {
		loadOrders();
		const interval = setInterval(loadOrders, 5000);
		return () => clearInterval(interval);
	}, []);

	// Переключение проблемной позиции
	const toggleProblemItem = (orderId, itemIndex) => {
		setProblemItems(prev => {
			const orderProblems = prev[orderId] || [];
			if (orderProblems.includes(itemIndex)) {
				return {
					...prev,
					[orderId]: orderProblems.filter(i => i !== itemIndex)
				};
			} else {
				return {
					...prev,
					[orderId]: [...orderProblems, itemIndex]
				};
			}
		});
	};

	// Выдача заказа
	const handleComplete = (orderId) => {
		const problems = problemItems[orderId] || [];

		if (problems.length > 0) {
			alert('❌ Отмечены проблемные позиции. Либо снимите отметки, либо используйте кнопку "На доработку".');
			return;
		}

		setLoading(true);
		updateOrderStatus(orderId, 'completed');
		setProblemItems(prev => {
			const newState = { ...prev };
			delete newState[orderId];
			return newState;
		});
		loadOrders();
		setLoading(false);
	};

	// Отправка на доработку
	const handleRework = (order) => {
		const problems = problemItems[order.id] || [];

		if (problems.length === 0) {
			alert('❌ Не отмечено ни одной проблемной позиции. Отметьте позиции для доработки.');
			return;
		}

		// Формируем позиции для доработки
		const reworkItems = problems.map(idx => ({
			menuId: order.items[idx].menuId,
			qty: order.items[idx].quantity
		}));

		// Проверяем наличие сырья
		const result = consumeIngredients(reworkItems);

		if (!result.success) {
			// Недостаточно сырья - отменяе м весь заказ
			alert(`❌ Невозможно приготовить заново — недостаточно сырья: ${result.message}. Заказ отменён.`);
			updateOrderStatus(order.id, 'cancelled');
		} else {
			updateOrderStatus(order.id, 'accepted');
			updateOrderDate(order.id);
			alert(`✅ Заказ #${order.id} отправлен повару для переделки проблемных позиций.`);
		}

		// Очищаем проблемные позиции для этого заказа
		setProblemItems(prev => {
			const newState = { ...prev };
			delete newState[order.id];
			return newState;
		});

		loadOrders();
	};

	const formatTime = (isoString) => {
		const date = new Date(isoString);
		const now = new Date();
		const diffMinutes = Math.floor((now - date) / 60000);

		if (diffMinutes < 1) return 'Только что';
		if (diffMinutes < 60) return `${diffMinutes} мин назад`;
		return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
	};

	return (
		<>
			{orders.length === 0 ? (<div className="quality-panel">
				<div className="quality-header">
					<h2>Отдел качества</h2>
				</div>
				<div className="empty-queue">
					<div className="empty-icon">✅</div>
					<h3>Нет готовых заказов</h3>
					<p>Заказы, готовые к выдаче, появятся здесь</p>
				</div>
			</div>) : (<div className="quality-panel">
				<div className="quality-header">
					<h2>Отдел качества</h2>
					<div className="queue-stats">
						<span className="queue-count">{orders.length} готово к выдаче</span>
					</div>
				</div>

				<div className="quality-queue">
					{orders.map((order) => {
						const problems = problemItems[order.id] || [];
						const hasProblems = problems.length > 0;

						return (
							<div key={order.id} className="quality-order-card">
								<div className="order-header">
									<div className="order-number">
										<span className="order-id">Заказ # {order.id} {order.user.name}</span>
										<span className="order-time">{formatTime(order.createdAt)}</span>
									</div>
									<div className={`order-status-badge ${hasProblems ? 'has-problems' : ''}`}>
										{hasProblems ? '⚠️ Есть проблемы' : '✅ Готов'}
									</div>
								</div>

								<div className="order-body">
									<div className="quality-items-list">
										{order.items.map((item, idx) => {
											const isProblem = problems.includes(idx);
											return (
												<div
													key={idx}
													className={`quality-item ${isProblem ? 'problem' : ''}`}
													onClick={() => toggleProblemItem(order.id, idx)}
												>
													<div className="item-checkbox">
														{isProblem ? '❌' : '⬜'}
													</div>
													<div className="item-info">
														<span className="item-name">{item.name}</span>
														<span className="item-qty">{item.quantity} шт.</span>
													</div>
													{isProblem && (
														<div className="problem-badge">Проблема</div>
													)}
												</div>
											);
										})}
									</div>
								</div>

								<div className="order-footer">
									<div className="order-meta">
                  <span className="total-items">
                    🛒 {order.items.reduce((sum, i) => sum + i.quantity, 0)} позиций
                  </span>
										<span className="total-price">{order.total} ₽</span>
									</div>
									<div className="action-buttons">
										<button
											className="complete-btn"
											onClick={() => handleComplete(order.id)}
											disabled={loading}
											title="Выдать заказ"
										>
											<span className="btn-icon">✅</span>
											Выдать
										</button>
										<button
											className="rework-btn"
											onClick={() => handleRework(order)}
											disabled={loading}
											title="Отправить на доработку"
										>
											<span className="btn-icon">❌</span>
											На доработку
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>)}
		</>

	);
};