import { isMenuItemAvailable } from "../../../data/Data.js";
import { useState, useMemo } from "react";
import './MenuView.css'

export const MenuView = ({ menu, cart, onAddToCart, onRemoveFromCart, onUpdateQty, onCheckout, getTotal }) => {
	const [activeCategory, setActiveCategory] = useState('all');
	const [paymentMethod, setPaymentMethod] = useState('card');

	// Категории
	const categories = [
		{ id: 'all', name: 'Все' },
		{ id: 'shawerma', name: 'Шаверма' },
		{ id: 'snacks', name: 'Закуски' },
		{ id: 'drinks', name: 'Напитки' },
	];

	// Названия категорий для заголовков
	const categoryTitles = {
		shawerma: 'Шаверма',
		snacks: 'Закуски',
		drinks: 'Напитки',
	};

	// Фильтруем меню
	const filteredMenu = activeCategory === 'all'
		? menu
		: menu.filter(item => item.category === activeCategory);

	// Группируем блюда по категориям (только для режима "Все")
	const groupedMenu = useMemo(() => {
		if (activeCategory !== 'all') return null;

		const groups = {};
		menu.forEach(item => {
			if (!groups[item.category]) {
				groups[item.category] = [];
			}
			groups[item.category].push(item);
		});
		return groups;
	}, [menu, activeCategory]);

	// Рендер карточки блюда
	const renderMenuItem = (item) => {
		const available = isMenuItemAvailable(item);
		return (
			<div key={item.id} className={`menu-card ${!available ? 'disabled' : ''}`}>
				<div className="menu-card-image">
					<img src={item.src} alt={item.name} />
				</div>
				<div className="menu-card-content">
					<h3>{item.name}</h3>
					<div className="menu-card-weight">{item.weight}</div>
					<div className="menu-card-description">
						{item.ingredients.map(ingredient => {
							return ingredient.productName + " "
						})}
					</div>
					<button
						onClick={() => onAddToCart(item)}
						disabled={!available}
					>
						{available ? `${item.current_price} ₽` : 'Нет в наличии'}
					</button>
				</div>
			</div>
		);
	};


	const renderMenuContent = () => {
		// Если выбрана конкретная категория - показываем без заголовка
		if (activeCategory !== 'all') {
			return (
				<div className="menu-grid">
					{filteredMenu.map(item => renderMenuItem(item))}
				</div>
			);
		}

		// Если выбрано "Все" - группируем по категориям с заголовками
		return (
			<div className="menu-grouped">
				{Object.entries(groupedMenu).map(([categoryId, items]) => (
					<div key={categoryId} className="menu-category-section">
						<h2 className="category-title">{categoryTitles[categoryId]}</h2>
						<div className="menu-grid">
							{items.map(item => renderMenuItem(item))}
						</div>
					</div>
				))}
			</div>
		);
	};

	return (
		<>
			{/* Навигация по категориям */}
			<div className="categories-nav">
				{categories.map(cat => (
					<button
						key={cat.id}
						className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
						onClick={() => setActiveCategory(cat.id)}
					>
						{cat.name}
					</button>
				))}
			</div>

			{/* Основной контент */}
			<div className="menu-content">
				<div className="menu-section">
					{renderMenuContent()}
				</div>

				{/* Корзина */}
				<div className="cart">
					<h3>Корзина</h3>
					{cart.length === 0 ? (
						<div className="cart-empty">
							<p>🛒</p>
							<p>Ваша корзина пуста</p>
						</div>
					) : (
						<>
							<div className="cart-items">
								{cart.map(item => {
									const menuItem = menu.find(m => m.id === item.menuId);
									return (
										<div key={item.menuId} className="cart-item">
											<div className="cart-item-info">
												<div className="cart-item-name">{menuItem?.name}</div>
												<div className="cart-item-price">{menuItem?.current_price} ₽</div>
											</div>
											<div className="cart-item-controls">
												<button
													className="cart-item-btn"
													onClick={() => onUpdateQty(item.menuId, -1)}
												>
													−
												</button>
												<span className="cart-item-qty">{item.qty}</span>
												<button
													className="cart-item-btn"
													onClick={() => onUpdateQty(item.menuId, 1)}
												>
													+
												</button>
												<button
													className="cart-item-remove"
													onClick={() => onRemoveFromCart(item.menuId)}
												>
													🗑️
												</button>
											</div>
										</div>
									);
								})}
							</div>
							{/* Выбор способа оплаты */}
							<div className="payment-methods">
								<h4>Способ оплаты</h4>
								<div className="payment-options">
									<label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
										<input
											type="radio"
											name="payment"
											value="card"
											checked={paymentMethod === 'card'}
											onChange={() => setPaymentMethod('card')}
										/>
										<span className="payment-icon">💳</span>
										<span className="payment-label">Карта</span>
									</label>

									<label className={`payment-option ${paymentMethod === 'sbp' ? 'selected' : ''}`}>
										<input
											type="radio"
											name="payment"
											value="sbp"
											checked={paymentMethod === 'sbp'}
											onChange={() => setPaymentMethod('sbp')}
										/>
										<span className="payment-icon">📱</span>
										<span className="payment-label">СБП</span>
									</label>
								</div>
							</div>
							<div className="cart-total">
								<span>Итого:</span>
								<span>{getTotal()} ₽</span>
							</div>
							<button className="checkout-btn" onClick={onCheckout}>
								Оформить заказ
							</button>
						</>
					)}
				</div>
			</div>
		</>
	);
};