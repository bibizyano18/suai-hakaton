import './Login.css'
import {loginOrRegister} from "../data/Data.js";


export const Login = ({onLogin}) => {

	const handlePhoneSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const user = loginOrRegister(formData.get('phone'), formData.get('name'));
		onLogin(user);
	};
	return (
		<>
			<h1>Вход</h1>
			<form onSubmit={handlePhoneSubmit}>
				<div className="input">
					<label htmlFor="phone">
						Введите свои данные:<br/>
					</label>

					<input
						type="tel"
						id="phone"
						name="phone"
						// pattern="8\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}"
						placeholder="8(812)456-78-90"
						maxLength="11"
						required
						autoFocus/>
					<input
						type="name"
						id="name"
						name="name"
						placeholder="Имя"
						maxLength="15"
						/>
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
