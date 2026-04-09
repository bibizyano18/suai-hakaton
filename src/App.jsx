import {Login} from "./user/Login.jsx"
import {initData, getCurrentUser, logout} from './data/Data.js';
import './App.css'
import {useEffect, useState} from "react";
import {ClientPanel} from "./user/client/ClientPanel.jsx";
import {CookPanel} from "./cook/CookPanel.jsx";
import {QualityPanel} from "./quality/QualityPanel.jsx";
import {AdminPanel} from "./admin/AdminPanel.jsx";

const App = () => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('client'); // 'client', 'cook', 'quality', 'admin'

    useEffect(() => {
        initData(); // инициализируем БД
        const savedUser = getCurrentUser();
        if (savedUser) setUser(savedUser);
    }, []);

    if (!user) {
        return <Login onLogin={user => setUser(user)} />;
    }

    const handleLogout = () => {
        logout();
        setUser(null);
    };

    return (
        <div className="app">
            <header className="app-header">
                <div>Кофейня NEO SHAVA | {user.phone} | {user.name}</div> {/*шапка*/}
                <div className="role-switcher">
                    <button onClick={() => setRole('client')} className={role === 'client' ? 'active' : ''}>Клиент</button>
                    <button onClick={() => setRole('cook')} className={role === 'cook' ? 'active' : ''}>Повар</button>
                    <button onClick={() => setRole('quality')} className={role === 'quality' ? 'active' : ''}>Пушистый</button>
                    <button onClick={() => setRole('admin')} className={role === 'admin' ? 'active' : ''}>Админ</button>
                    <button onClick={handleLogout}>Выйти</button>
                </div>
            </header>
            <main>
                {role === 'client' && <ClientPanel user={user} />}
                {role === 'cook' && <CookPanel />}
                {role === 'quality' && <QualityPanel />}
                {role === 'admin' && <AdminPanel />}
            </main>
        </div>
    );
};

export default App
