// src/components/DistributionManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DistributionManager = () => {
  const [distributions, setDistributions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    discipline: '',
    group_name: '',
    teacher_id: '',
    type: 'coursework',
    deadline: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Типы работ
  const workTypes = [
    { value: 'coursework', label: 'Курсовая работа' },
    { value: 'bachelor', label: 'Бакалаврская ВКР' },
    { value: 'master', label: 'Магистерская диссертация' },
    { value: 'other', label: 'Другая работа' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Получаем распределения
      const distributionsRes = await axios.get(`${process.env.REACT_APP_API_URL}/user/distributions`);
      setDistributions(distributionsRes.data);
      
      // Получаем преподавателей
      const teachersRes = await axios.get(`${process.env.REACT_APP_API_URL}/user/teachers`);
      setTeachers(teachersRes.data);
      
      // Получаем темы
      const themesRes = await axios.get(`${process.env.REACT_APP_API_URL}/user/listthemes`);
      setThemes(themesRes.data);
      
      setLoading(false);
    } catch (err) {
      setError('Ошибка при загрузке данных');
      console.error('Ошибка:', err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Сброс ошибки при изменении поля
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.discipline.trim()) {
      errors.discipline = 'Дисциплина обязательна';
    }
    
    if (!formData.group_name.trim()) {
      errors.group_name = 'Группа обязательна';
    }
    
    if (!formData.teacher_id) {
      errors.teacher_id = 'Преподаватель обязателен';
    }
    
    if (!formData.deadline) {
      errors.deadline = 'Срок выполнения обязателен';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitSuccess(false);
      
      // Отправляем данные
      await axios.post(`${process.env.REACT_APP_API_URL}/user/distributions`, {
        ...formData,
        deadline: new Date(formData.deadline).toISOString()
      });
      
      // Обновляем список распределений
      fetchData();
      
      // Сбрасываем форму
      setFormData({
        discipline: '',
        group_name: '',
        teacher_id: '',
        type: 'coursework',
        deadline: ''
      });
      
      setSubmitSuccess(true);
      setShowForm(false);
      
      // Сброс сообщения об успехе через 3 секунды
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error('Ошибка при создании распределения:', err);
      setFormErrors({
        ...formErrors,
        server: 'Ошибка при создании распределения: ' + (err.response?.data?.error || err.message)
      });
    }
  };

  const toggleDistributionStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'closed' : 'active';
      await axios.patch(`${process.env.REACT_APP_API_URL}/user/distributions/${id}/status`, {
        status: newStatus
      });
      
      // Обновляем локальное состояние
      setDistributions(distributions.map(dist => 
        dist.id === id ? { ...dist, status: newStatus } : dist
      ));
    } catch (err) {
      console.error('Ошибка при изменении статуса:', err);
      setError('Ошибка при изменении статуса распределения');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Управление распределением тем</h2>
            <p className="text-gray-600 mt-1">
              Всего распределений: {distributions.length} | 
              Преподавателей: {teachers.length} | 
              Тем: {themes.length}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showForm ? 'Отмена' : 'Создать распределение'}
          </button>
        </div>
      </div>

      {/* Форма создания нового распределения */}
      {showForm && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Создать новое распределение</h3>
          
          {formErrors.server && (
            <div className="mb-4 text-red-500 text-sm">{formErrors.server}</div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="discipline" className="block text-sm font-medium text-gray-700 mb-1">
                Дисциплина *
              </label>
              <input
                type="text"
                id="discipline"
                name="discipline"
                value={formData.discipline}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.discipline ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Введите название дисциплины"
              />
              {formErrors.discipline && <p className="mt-1 text-sm text-red-500">{formErrors.discipline}</p>}
            </div>
            
            <div>
              <label htmlFor="group_name" className="block text-sm font-medium text-gray-700 mb-1">
                Группа *
              </label>
              <input
                type="text"
                id="group_name"
                name="group_name"
                value={formData.group_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.group_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Введите название группы"
              />
              {formErrors.group_name && <p className="mt-1 text-sm text-red-500">{formErrors.group_name}</p>}
            </div>
            
            <div>
              <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 mb-1">
                Преподаватель *
              </label>
              <select
                id="teacher_id"
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.teacher_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Выберите преподавателя</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              {formErrors.teacher_id && <p className="mt-1 text-sm text-red-500">{formErrors.teacher_id}</p>}
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Тип работы *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {workTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Срок выполнения *
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.deadline ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.deadline && <p className="mt-1 text-sm text-red-500">{formErrors.deadline}</p>}
            </div>
            
            <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Создать распределение
              </button>
            </div>
          </form>
        </div>
      )}

      {submitSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Распределение успешно создано!</p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дисциплина
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Группа
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Преподаватель
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Тип работы
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Срок выполнения
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {distributions.length > 0 ? (
              distributions.map((distribution) => {
                const teacher = teachers.find(t => t.id === distribution.teacher_id);
                const workType = workTypes.find(t => t.value === distribution.type);
                
                return (
                  <tr key={distribution.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {distribution.discipline}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {distribution.group_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher ? teacher.name : 'Неизвестно'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {workType ? workType.label : distribution.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(distribution.deadline)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        distribution.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {distribution.status === 'active' ? 'Активно' : 'Закрыто'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleDistributionStatus(distribution.id, distribution.status)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          distribution.status === 'active'
                            ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                            : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                        } focus:outline-none focus:ring-2`}
                      >
                        {distribution.status === 'active' ? 'Закрыть' : 'Активировать'}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  Распределения не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DistributionManager;