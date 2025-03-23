import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from . import database

# Test database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    """Create a test database engine"""
    # Create test database tables
    database.Base.metadata.create_all(bind=engine)
    yield engine
    # Clean up after tests
    database.Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create a fresh database session for each test"""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def test_user():
    """Create test user data"""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword"
    }

@pytest.fixture(scope="function")
def test_api_key():
    """Create test API key data"""
    return {
        "exchange": "lbank",
        "api_key": "test_api_key",
        "api_secret": "test_api_secret"
    }

@pytest.fixture(scope="function")
def test_trading_pair():
    """Create test trading pair data"""
    return {
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

@pytest.fixture(scope="function")
def test_candlestick():
    """Create test candlestick data"""
    return {
        "timestamp": 1234567890000,
        "open": 50000,
        "high": 50100,
        "low": 49900,
        "close": 50050,
        "volume": 1000
    }

@pytest.fixture(scope="function")
def test_position():
    """Create test position data"""
    return {
        "position_id": "123",
        "symbol": "BTC_USDT",
        "side": "long",
        "quantity": 0.1,
        "entry_price": 50000,
        "current_price": 50500,
        "leverage": 10,
        "pnl": 50,
        "is_open": True
    }

@pytest.fixture(scope="function")
def test_trade():
    """Create test trade data"""
    return {
        "id": 1,
        "symbol": "BTC_USDT",
        "side": "buy",
        "price": 50000,
        "quantity": 0.1,
        "fee": 0.1,
        "created_at": "2024-01-01T00:00:00"
    }

@pytest.fixture(scope="function")
def test_market_analysis():
    """Create test market analysis data"""
    return {
        "symbol": "BTC_USDT",
        "timeframe": "1h",
        "analysis": {
            "trend": "bullish",
            "momentum": "neutral",
            "volatility": "low",
            "current_price": 50500,
            "rsi": 55,
            "sma_20": 50000,
            "sma_50": 49000
        }
    } 