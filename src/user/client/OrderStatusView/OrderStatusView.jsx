import {useEffect, useState} from "react";
import {getData} from "../../../data/Data.js";
import "./OrderStatusView.css"

export const OrderStatusView = ({ order, onBackToMenu }) => {
	const [currentOrder, setCurrentOrder] = useState(order);

	useEffect(() => {
		// Периодически обновляем статус заказа
		const interval = setInterval(() => {
			const orders = getData('orders');
			const updated = orders.find(o => o.id === order.id);
			if (updated) {
				setCurrentOrder(updated);
				// Если заказ завершён или отменён, можно автоматически вернуться в меню
				if (updated.status === 'completed' || updated.status === 'cancelled') {
					// Опционально: показать сообщение и кнопку возврата
				}
			}
		}, 2000);
		return () => clearInterval(interval);
	}, [order.id]);


	const steps = ['accepted', 'ready', 'completed'];
	const currentStepIndex = steps.indexOf(currentOrder.status);
	const isCancelled = currentOrder.status === 'cancelled';

	return (
		<div className="order-status">
			<h2>Заказ # {currentOrder.id} {currentOrder.user.name}</h2>

			{!isCancelled ? (
				<div className="status-steps">
					<div className={`step ${currentStepIndex >= 0 ? 'active' : ''}`}>
						<span className="step-number">1</span>
						<span className="step-label">Готовится</span>
					</div>
					<div className={`step ${currentStepIndex >= 1 ? 'active' : ''}`}>
						<span className="step-number">2</span>
						<span className="step-label">Готов к выдаче</span>
					</div>
					<div className={`step ${currentStepIndex >= 2 ? 'active' : ''}`}>
						<span className="step-number">3</span>
						<span className="step-label">Выдан</span>
					</div>
				</div>
			) : (
				<div className="cancelled-message">
					<p>❌ Заказ отменён. Пожалуйста, подойдите к кассе.</p>
				</div>
			)}

			{currentOrder.status === 'ready' && (
				<div className="ready-notification">
					✅ Ваш заказ готов! Можете забрать на стойке выдачи.
				</div>
			)}

			<div className="order-details">
				<h3>Состав заказа:</h3>
				<ul>
					{currentOrder.items.map((item, idx) => (
						<li key={idx}>{item.name} x {item.quantity} — {item.price * item.quantity} ₽</li>
					))}
				</ul>
				<p className="order-total">Итого: {currentOrder.total} ₽</p>
			</div>

			<button onClick={onBackToMenu} className="back-btn">
				← Вернуться в меню
			</button>
		</div>
	);
};
export const getStatusText = (status) => {
	const statusMap = {
		'accepted': 'Готовится',
		'ready': 'Готов к выдаче',
		'completed': 'Выдан',
		'cancelled': 'Отменён'
	};
	return statusMap[status] || status;
};