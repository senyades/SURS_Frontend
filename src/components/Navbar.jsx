import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: "main", label: "Главная" },
    { path: "topics", label: "Банк тем" },
    { path: "students", label: "Студенты" },
    { path: "teachers", label: "Преподаватели" },
    { path: "distribution", label: "Распределение" },
  ];

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4 flex flex-col">
      <div className="mb-8 mt-4">
        <h1 className="text-xl font-bold">Система управления</h1>
      </div>
      
      <ul className="space-y-2 flex-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink 
              to={item.path}
              className={({isActive}) => 
                `block px-4 py-2 rounded transition ${
                  isActive 
                    ? 'bg-blue-600' 
                    : 'hover:bg-gray-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      
      <button 
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
      >
        Выход с аккаунта
      </button>
    </nav>
  );
};

export default Navbar;