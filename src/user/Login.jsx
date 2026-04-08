import {useState} from "react";
import './Login.css'


export const Login = () => {

	const [phone, setPhone] = useState('')
	const [phase, setPhase] = useState('getPhone')

	const handlePhoneSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const phoneValue = formData.get('phone');
		setPhone(phoneValue);
		setPhase('sendCode');
	};
	const handleCodeSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const code = formData.get('code');
		console.log('Отправка кода:', { phone, code });

	};
	if (phase === 'sendCode') {
		return (
			<>
				<h1>Подтверждение</h1>
				<form className="login-form" onSubmit={handleCodeSubmit}>

				</form>
			</>
		);
	}
	return (
		<>
			<h1>Вход</h1>
			<form onSubmit={handlePhoneSubmit}>
				<div className="input">
					<label htmlFor="phone">
						Введите номер телефона:<br/>
					</label>

					<input
						type="tel"
						id="phone"
						name="phone"
						pattern="8\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}"
						placeholder="8(812)456-78-90"
						required
						autoFocus/>
					<button
						type="submit"
						className="login-button"
						>Войти
					</button>
				</div>
			</form>
		</>
	)
}
