import React, { useState } from 'react';
import axios from 'axios';

export default function AuthPage() {
  const [form, setForm] = useState('login');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [message, setMessage] = useState('');

  const handleAuth = async () => {
    try {
      if (form === 'register') {
        const res = await axios.post( `${process.env.REACT_APP_API_URL}/auth/register`, {
          login,
          password,
          role,
          full_name: fullName,
        });
        setMessage(res.data.message);
        setForm('login');
      } else {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
          login,
          password,
        });
        const { user } = res.data;
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Ошибка');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center">
          {form === 'register' ? 'Регистрация' : 'Вход'}
        </h2>

        {form === 'register' && (
          <>
            <input
              className="w-full mb-2 p-2 border rounded"
              placeholder="ФИО"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
            <select
              className="w-full mb-2 p-2 border rounded"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="student">Студент</option>
              <option value="teacher">Преподаватель</option>
            </select>
          </>
        )}

        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Логин"
          value={login}
          onChange={e => setLogin(e.target.value)}
        />
        <input
          type="password"
          className="w-full mb-4 p-2 border rounded"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={handleAuth}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {form === 'register' ? 'Зарегистрироваться' : 'Войти'}
        </button>

        <p className="text-center mt-4 text-sm text-gray-600">
          {form === 'register' ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
          <button
            className="text-blue-600 underline"
            onClick={() => setForm(form === 'register' ? 'login' : 'register')}
          >
            {form === 'register' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </p>

        {message && <p className="mt-4 text-center text-red-600">{message}</p>}
      </div>
    </div>
  );
}
