import React, { useState, useEffect } from 'react';
import axios from 'axios';

function APIKeyManager() {
  const [apiKeys, setApiKeys] = useState([]);
  const [formData, setFormData] = useState({
    exchange: 'lbank',
    api_key: '',
    secret_key: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api-keys/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setApiKeys(response.data);
    } catch (err) {
      setError('خطا در دریافت API Key ها');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api-keys/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setSuccess('API Key با موفقیت اضافه شد');
        setFormData({
          exchange: 'lbank',
          api_key: '',
          secret_key: ''
        });
        fetchAPIKeys();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'خطا در افزودن API Key');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api-keys/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess('API Key با موفقیت حذف شد');
      fetchAPIKeys();
    } catch (err) {
      setError('خطا در حذف API Key');
    }
  };

  return (
    <div className="api-key-manager">
      <h2>مدیریت API Key ها</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>صرافی:</label>
          <select
            name="exchange"
            value={formData.exchange}
            onChange={handleChange}
            required
          >
            <option value="lbank">LBank</option>
          </select>
        </div>
        <div className="form-group">
          <label>API Key:</label>
          <input
            type="text"
            name="api_key"
            value={formData.api_key}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Secret Key:</label>
          <input
            type="password"
            name="secret_key"
            value={formData.secret_key}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">افزودن API Key</button>
      </form>

      <div className="api-keys-list">
        <h3>API Key های موجود</h3>
        <table>
          <thead>
            <tr>
              <th>صرافی</th>
              <th>API Key</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map(key => (
              <tr key={key.id}>
                <td>{key.exchange}</td>
                <td>{key.api_key.substring(0, 8)}...</td>
                <td>{key.is_active ? 'فعال' : 'غیرفعال'}</td>
                <td>
                  <button
                    onClick={() => handleDelete(key.id)}
                    className="delete-btn"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default APIKeyManager; 