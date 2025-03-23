import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from . import trading

# Test data
test_candlesticks = [
    {
        "timestamp": int((datetime.now() - timedelta(hours=i)).timestamp() * 1000),
        "open": 50000 + i * 100,
        "high": 50100 + i * 100,
        "low": 49900 + i * 100,
        "close": 50050 + i * 100,
        "volume": 1000 + i * 100
    }
    for i in range(100)
]

test_trading_pairs = [
    {
        "symbol": "BTC_USDT",
        "base_asset": "BTC",
        "quote_asset": "USDT",
        "price_precision": 2,
        "quantity_precision": 6,
        "min_qty": 0.001,
        "max_qty": 100,
        "min_notional": 10,
        "status": "TRADING"
    }
]

@pytest.fixture
def mock_response():
    """Create a mock response object"""
    mock = MagicMock()
    mock.json.return_value = test_candlesticks
    return mock

@pytest.fixture
def mock_trading_pairs_response():
    """Create a mock response object for trading pairs"""
    mock = MagicMock()
    mock.json.return_value = test_trading_pairs
    return mock

def test_generate_signature():
    """Test signature generation"""
    params = {
        "api_key": "test_key",
        "timestamp": "1234567890",
        "symbol": "BTC_USDT"
    }
    secret_key = "test_secret"
    signature = trading.generate_signature(params, secret_key)
    assert isinstance(signature, str)
    assert len(signature) == 64

@patch('requests.get')
def test_get_trading_pairs(mock_get, mock_trading_pairs_response):
    """Test getting trading pairs"""
    mock_get.return_value = mock_trading_pairs_response
    pairs = trading.get_trading_pairs()
    assert isinstance(pairs, list)
    assert len(pairs) == 1
    assert pairs[0]["symbol"] == "BTC_USDT"

@patch('requests.get')
def test_get_candlesticks(mock_get, mock_response):
    """Test getting candlesticks"""
    mock_get.return_value = mock_response
    candlesticks = trading.get_candlesticks("BTC_USDT")
    assert isinstance(candlesticks, list)
    assert len(candlesticks) == 100
    assert all(isinstance(c["timestamp"], int) for c in candlesticks)

def test_calculate_technical_indicators():
    """Test technical indicator calculations"""
    # Create test DataFrame
    df = pd.DataFrame(test_candlesticks)
    
    # Calculate indicators
    df = trading.calculate_technical_indicators(df)
    
    # Check if all indicators are present
    assert "sma_20" in df.columns
    assert "sma_50" in df.columns
    assert "ema_20" in df.columns
    assert "rsi" in df.columns
    assert "bb_high" in df.columns
    assert "bb_low" in df.columns

def test_analyze_market_data():
    """Test market data analysis"""
    # Create test DataFrame
    df = pd.DataFrame(test_candlesticks)
    
    # Analyze market data
    analysis = trading.analyze_market_data(df)
    
    # Check if all required fields are present
    assert "trend" in analysis
    assert "momentum" in analysis
    assert "volatility" in analysis
    assert "current_price" in analysis
    assert "rsi" in analysis
    assert "sma_20" in analysis
    assert "sma_50" in analysis

@patch('openai.OpenAI')
def test_get_ai_analysis(mock_openai):
    """Test AI market analysis"""
    # Mock OpenAI response
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content="""
                Market sentiment: bullish
                Confidence level: 85
                Recommended action: buy
                Key support and resistance levels: Support at 50000, Resistance at 51000
                Risk assessment: Low risk due to strong technical indicators
                """
            )
        )
    ]
    mock_openai.return_value.chat.completions.create.return_value = mock_response
    
    # Test technical analysis
    technical_analysis = {
        "trend": "bullish",
        "momentum": "neutral",
        "volatility": "low",
        "current_price": 50500,
        "rsi": 55,
        "sma_20": 50000,
        "sma_50": 49000
    }
    
    analysis = trading.get_ai_analysis("BTC_USDT", technical_analysis)
    
    # Check if all required fields are present
    assert "sentiment" in analysis
    assert "confidence" in analysis
    assert "recommendation" in analysis
    assert "analysis" in analysis

@patch('requests.post')
def test_execute_trade(mock_post):
    """Test trade execution"""
    # Mock API response
    mock_response = MagicMock()
    mock_response.json.return_value = {"order_id": "123", "status": "FILLED"}
    mock_post.return_value = mock_response
    
    # Test trade execution
    result = trading.execute_trade(
        symbol="BTC_USDT",
        side="buy",
        quantity=0.1,
        leverage=10,
        api_key="test_key",
        secret_key="test_secret"
    )
    
    assert result["order_id"] == "123"
    assert result["status"] == "FILLED"

@patch('requests.post')
def test_close_position(mock_post):
    """Test position closing"""
    # Mock API response
    mock_response = MagicMock()
    mock_response.json.return_value = {"position_id": "123", "status": "CLOSED"}
    mock_post.return_value = mock_response
    
    # Test position closing
    result = trading.close_position(
        symbol="BTC_USDT",
        position_id="123",
        api_key="test_key",
        secret_key="test_secret"
    )
    
    assert result["position_id"] == "123"
    assert result["status"] == "CLOSED"

@patch('requests.get')
def test_get_positions(mock_get):
    """Test getting positions"""
    # Mock API response
    mock_response = MagicMock()
    mock_response.json.return_value = [
        {
            "position_id": "123",
            "symbol": "BTC_USDT",
            "side": "long",
            "quantity": 0.1,
            "entry_price": 50000
        }
    ]
    mock_get.return_value = mock_response
    
    # Test getting positions
    positions = trading.get_positions("test_key", "test_secret")
    
    assert isinstance(positions, list)
    assert len(positions) == 1
    assert positions[0]["symbol"] == "BTC_USDT" 