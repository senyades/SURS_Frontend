import React, { useState, useEffect } from 'react';

const TopicBank = () => {
  // Маппинг типов работ
  const workTypeMapping = {
    'Курсовая работа': 'coursework',
    'ВКР бакалавра': 'bachelor',
    'ВКР магистра': 'master',
    'Другая работа': 'other'
  };

  // Маппинг источников тем
  const sourceTypeMapping = {
    'Преподаватель': 'teacher',
    'Студент': 'student',
    'Работодатель': 'employer',
    'Другой источник': 'other'
  };

  // Состояния для тем
  const [topics, setTopics] = useState([]);
  
  // Состояние для новой темы
  const [newTopic, setNewTopic] = useState({
    title: '',
    type: '',
    source: '',
    supervisor: '',
    description: '',
    priority: '0'
  });

  // Состояние для ошибок формы
  const [errors, setErrors] = useState({});

  // Состояние для преподавателей
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загрузка преподавателей
        const teachersResponse = await fetch(`${process.env.REACT_APP_API_URL}/user/teachers`);
        if (!teachersResponse.ok) {
          throw new Error('Не удалось загрузить список преподавателей');
        }
        const teachersData = await teachersResponse.json();
        setTeachers(teachersData);
        
        // Загрузка тем
        const themesResponse = await fetch(`${process.env.REACT_APP_API_URL}/user/listthemes`);
        if (!themesResponse.ok) {
          throw new Error('Не удалось загрузить список тем');
        }
        const themesData = await themesResponse.json();
        
        // Преобразование данных для отображения
        const formattedThemes = themesData.map(theme => {
          // Преобразование типа
          let typeDisplay;
          switch (theme.type) {
            case 'coursework': typeDisplay = 'Курсовая работа'; break;
            case 'bachelor': typeDisplay = 'ВКР бакалавра'; break;
            case 'master': typeDisplay = 'ВКР магистра'; break;
            default: typeDisplay = 'Другая работа';
          }
          
          // Преобразование источника
          let sourceDisplay;
          switch (theme.source) {
            case 'teacher': sourceDisplay = 'Преподаватель'; break;
            case 'student': sourceDisplay = 'Студент'; break;
            case 'employer': sourceDisplay = 'Работодатель'; break;
            default: sourceDisplay = 'Другой источник';
          }
          
          // Преобразование статуса
          let statusDisplay;
          switch (theme.status) {
            case 'available': statusDisplay = 'Доступна'; break;
            case 'reserved': statusDisplay = 'Зарезервирована'; break;
            case 'approved': statusDisplay = 'Утверждена'; break;
            case 'completed': statusDisplay = 'Завершена'; break;
            default: statusDisplay = theme.status;
          }
          
          return {
            id: theme.id,
            title: theme.title,
            type: typeDisplay,
            source: sourceDisplay,
            supervisor: theme.supervisor_name || 'Не назначен',
            status: statusDisplay,
            description: theme.description,
            priority: theme.priority
          };
        });
        
        setTopics(formattedThemes);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Обработчик изменений в форме
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTopic({
      ...newTopic,
      [name]: value
    });
    
    // Сбросить ошибку при изменении поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Валидация полей
      const newErrors = {};
      
      if (!newTopic.title.trim()) {
        newErrors.title = 'Введите название темы';
      }
      
      if (!workTypeMapping[newTopic.type]) {
        newErrors.type = 'Выберите тип работы';
      }
      
      if (!sourceTypeMapping[newTopic.source]) {
        newErrors.source = 'Выберите источник темы';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // Подготовка данных для отправки
      const themeData = {
        title: newTopic.title,
        description: newTopic.description,
        type: workTypeMapping[newTopic.type],
        source: sourceTypeMapping[newTopic.source],
        supervisor_id: newTopic.supervisor ? parseInt(newTopic.supervisor) : null,
        priority: parseInt(newTopic.priority)
      };

      // Отправка запроса на сервер
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user/themes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(themeData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при добавлении темы');
      }

      // Находим выбранного преподавателя
      const selectedTeacher = teachers.find(t => t.id === parseInt(newTopic.supervisor));
      
      // Преобразуем данные новой темы для отображения
      const newTopicForDisplay = {
        id: data.theme.id,
        title: data.theme.title,
        type: newTopic.type,
        source: newTopic.source,
        supervisor: selectedTeacher ? selectedTeacher.name : 'Не назначен',
        status: 'Доступна',
        description: data.theme.description,
        priority: data.theme.priority
      };

      // Обновление локального состояния
      setTopics([...topics, newTopicForDisplay]);

      // Сброс формы
      setNewTopic({
        title: '',
        type: '',
        source: '',
        supervisor: '',
        description: '',
        priority: '0'
      });
      
      // Сброс ошибок
      setErrors({});

      // Уведомление об успехе
      alert('Тема успешно добавлена!');
      
    } catch (error) {
      console.error('Ошибка:', error);
      alert(`Ошибка при добавлении темы: ${error.message}`);
    }
  };

  // Типы работ
  const workTypes = [
    'Курсовая работа',
    'ВКР бакалавра',
    'ВКР магистра',
    'Другая работа'
  ];

  // Источники тем
  const topicSources = [
    'Преподаватель',
    'Студент',
    'Работодатель',
    'Другой источник'
  ];

  // Приоритеты
  const priorities = [
    { value: '0', label: 'Нет приоритета' },
    { value: '1', label: 'Низкий' },
    { value: '2', label: 'Средний' },
    { value: '3', label: 'Высокий' }
  ];

  if (loading) {
    return <div className="p-6 flex justify-center items-center h-64">
      <div className="text-lg">Загрузка данных...</div>
    </div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        <h2 className="text-xl font-bold mb-4">Ошибка</h2>
        <p>{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Повторить попытку
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Банк тем</h1>
      
      {/* Таблица тем */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название темы</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип работы</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Источник</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Научный руководитель</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topics.map(topic => (
              <tr key={topic.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{topic.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{topic.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{topic.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{topic.source}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{topic.supervisor}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    topic.status === 'Доступна' ? 'bg-green-100 text-green-800' :
                    topic.status === 'Зарезервирована' ? 'bg-blue-100 text-blue-800' :
                    topic.status === 'Утверждена' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {topic.status}
                  </span>
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{topic.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Форма добавления новой темы */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Добавить новую тему</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Название темы:
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                placeholder="Введите название темы"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${
                  errors.title ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 
                  'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                value={newTopic.title}
                onChange={handleInputChange}
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Тип работы:
              </label>
              <select
                id="type"
                name="type"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${
                  errors.type ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 
                  'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                value={newTopic.type}
                onChange={handleInputChange}
              >
                <option value="">Выберите тип</option>
                {workTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
            </div>
            
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                Источник темы:
              </label>
              <select
                id="source"
                name="source"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${
                  errors.source ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 
                  'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                value={newTopic.source}
                onChange={handleInputChange}
              >
                <option value="">Выберите источник</option>
                {topicSources.map((source, index) => (
                  <option key={index} value={source}>{source}</option>
                ))}
              </select>
              {errors.source && <p className="mt-1 text-sm text-red-500">{errors.source}</p>}
            </div>
            
            <div>
              <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-1">
                Научный руководитель:
              </label>
              <select
                id="supervisor"
                name="supervisor"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={newTopic.supervisor}
                onChange={handleInputChange}
              >
                <option value="">Выберите преподавателя</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} {teacher.position && `(${teacher.position})`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Описание темы:
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                placeholder="Опишите детали темы..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={newTopic.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Приоритет преподавателя:
              </label>
              <select
                id="priority"
                name="priority"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={newTopic.priority}
                onChange={handleInputChange}
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Добавить тему
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TopicBank;