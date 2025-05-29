import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Routes, Route } from 'react-router-dom';
import StudentsList from './StudentsList'
import TopicsBank from './TopicsBank'; // Импортируем компонент банка тем
import TeachersList from './TeacherList'
import DistributionManager from './DistributionManager';


// Компонент карточки статистики
const StatCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded shadow">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

// Компонент таблицы распределений
const DistributionTable = () => {
  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-4 text-left">Дисциплина</th>
            <th className="py-3 px-4 text-left">Группа</th>
            <th className="py-3 px-4 text-left">Преподаватель</th>
            <th className="py-3 px-4 text-left">Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="4" className="py-6 px-4 text-center text-gray-500">
              Нет данных о распределениях
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// Основной компонент Dashboard с главной страницей
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalTopics: 0,
    availableTopics: 0,
    students: 0,
    teachers: 0
  });
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      window.location.href = '/auth';
      return;
    }
    setUser(userData);
    
    // Заглушка для загрузки статистики
    setTimeout(() => {
      setStats({
        totalTopics: 15,
        availableTopics: 8,
        students: 120,
        teachers: 15
      });
    }, 500);
  }, []);

  if (!user) {
    return <div className="p-6">Загрузка...</div>;
  }

  // Главная страница
  const MainPage = () => (
    <div>
      <h1 className="text-2xl font-bold mb-6">Добро пожаловать, {user?.full_name || 'пользователь'}!</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Статистика</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Всего тем" value={stats.totalTopics} />
          <StatCard title="Доступных тем" value={stats.availableTopics} />
          <StatCard title="Студентов" value={stats.students} />
          <StatCard title="Преподавателей" value={stats.teachers} />
        </div>
      </div>
      
      
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="flex-1 p-6">
        <Routes>
          <Route path="main" element={<MainPage />} />
          <Route path="topics" element={<TopicsBank />} />
          <Route index element={<MainPage />} />
           <Route path="students" element={<StudentsList />} />
           <Route path="teachers" element={<TeachersList />} />
           <Route path="distribution" element={<DistributionManager />} />
        </Routes>
      </div>
    </div>
  );
}