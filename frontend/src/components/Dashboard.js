import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TradingViewEmbed, widgetType } from 'react-tradingview-embed';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost:8000/api';

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tradingPairs, setTradingPairs] = useState([]);
  const [selectedPair, setSelectedPair] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [positions, setPositions] = useState([]);
  const [leverage, setLeverage] = useState(10);
  const [positionSize, setPositionSize] = useState(0.01);
  const [stopLoss, setStopLoss] = useState(2);
  const [takeProfit, setTakeProfit] = useState(4);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTradingPairs();
    fetchPositions();
  }, []);

  const fetchTradingPairs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trading-pairs`);
      setTradingPairs(response.data);
    } catch (err) {
      setError('خطا در دریافت لیست جفت ارزها');
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/positions`);
      setPositions(response.data);
    } catch (err) {
      setError('خطا در دریافت موقعیت‌های باز');
    }
  };

  const handlePairSelect = async (symbol) => {
    setSelectedPair(symbol);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, { symbol });
      setAnalysis(response.data);
    } catch (err) {
      setError('خطا در تحلیل بازار');
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async () => {
    if (!selectedPair) return;
    
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/trade`, {
        symbol: selectedPair,
        leverage,
        size: positionSize,
        stop_loss: stopLoss,
        take_profit: takeProfit
      });
      fetchPositions();
    } catch (err) {
      setError('خطا در اجرای معامله');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePosition = async (positionId) => {
    try {
      await axios.post(`${API_BASE_URL}/close-position/${positionId}`);
      fetchPositions();
    } catch (err) {
      setError('خطا در بستن موقعیت');
    }
  };

  const filteredTradingPairs = tradingPairs.filter(pair =>
    pair.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>سیستم معاملات خودکار LBank</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/api-keys')}>مدیریت API Keys</button>
          <button onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}>خروج</button>
        </div>
      </header>

      <main>
        <div className="search-section">
          <input
            type="text"
            placeholder="جستجوی جفت ارز..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="trading-pairs">
          <h2>جفت ارزهای موجود</h2>
          <table>
            <thead>
              <tr>
                <th>نماد</th>
                <th>قیمت</th>
                <th>حجم ۲۴ ساعت</th>
                <th>تغییر قیمت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredTradingPairs.map(pair => (
                <tr key={pair.symbol}>
                  <td>{pair.symbol}</td>
                  <td>{pair.price.toFixed(8)}</td>
                  <td>{pair.volume_24h.toFixed(2)}</td>
                  <td className={pair.price_change_24h >= 0 ? 'positive' : 'negative'}>
                    {pair.price_change_24h.toFixed(2)}%
                  </td>
                  <td>
                    <button onClick={() => handlePairSelect(pair.symbol)}>
                      انتخاب
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedPair && (
          <div className="trading-section">
            <h2>معامله {selectedPair}</h2>
            
            <div className="chart-container">
              <TradingViewEmbed
                widgetType={widgetType.ADVANCED_CHART}
                widgetConfig={{
                  symbol: selectedPair,
                  interval: '1h',
                  theme: 'dark',
                  style: '1',
                  locale: 'fa_IR',
                  toolbar_bg: '#f1f3f6',
                  enable_publishing: false,
                  allow_symbol_change: true,
                  save_image: false,
                  height: 500,
                  width: '100%',
                }}
              />
            </div>

            <div className="analysis-section">
              {loading ? (
                <p>در حال تحلیل...</p>
              ) : analysis ? (
                <div>
                  <h3>تحلیل بازار</h3>
                  <p>توصیه: {analysis.recommendation}</p>
                  <p>سطح اطمینان: {analysis.confidence}%</p>
                  <p>دلیل: {analysis.reasoning}</p>
                </div>
              ) : null}
            </div>

            <div className="trade-form">
              <h3>تنظیمات معامله</h3>
              <div>
                <label>اهرم:</label>
                <input
                  type="number"
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label>اندازه موقعیت:</label>
                <input
                  type="number"
                  value={positionSize}
                  onChange={(e) => setPositionSize(Number(e.target.value))}
                  min="0"
                  step="0.001"
                />
              </div>
              <div>
                <label>حد ضرر (%):</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label>حد سود (%):</label>
                <input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>
              <button onClick={handleTrade} disabled={loading}>
                {loading ? 'در حال اجرا...' : 'اجرای معامله'}
              </button>
            </div>
          </div>
        )}

        <div className="positions-section">
          <h2>موقعیت‌های باز</h2>
          <table>
            <thead>
              <tr>
                <th>نماد</th>
                <th>جهت</th>
                <th>اندازه</th>
                <th>قیمت ورود</th>
                <th>حد ضرر</th>
                <th>حد سود</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(position => (
                <tr key={position.id}>
                  <td>{position.symbol}</td>
                  <td>{position.side}</td>
                  <td>{position.size}</td>
                  <td>{position.entry_price}</td>
                  <td>{position.stop_loss}</td>
                  <td>{position.take_profit}</td>
                  <td>
                    <button onClick={() => handleClosePosition(position.id)}>
                      بستن
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default Dashboard; 