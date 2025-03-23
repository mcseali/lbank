from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from typing import Optional, List
from datetime import datetime

# مدل‌های کاربر
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# مدل‌های توکن
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# مدل‌های API Key
class APIKeyBase(BaseModel):
    api_key: str
    api_secret: str

class APIKeyCreate(APIKeyBase):
    pass

class APIKey(APIKeyBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# مدل‌های معامله
class TradeBase(BaseModel):
    symbol: str
    side: str
    size: float
    entry_price: float
    stop_loss: float
    take_profit: float
    leverage: int

class TradeCreate(TradeBase):
    pass

class Trade(TradeBase):
    id: int
    user_id: int
    is_open: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# مدل‌های تحلیل بازار
class MarketAnalysis(BaseModel):
    recommendation: str
    confidence: float
    reasoning: str
    entry_price: float
    stop_loss: float
    take_profit: float

# مدل‌های پاسخ API
class TradingPair(BaseModel):
    symbol: str
    price: float
    volume_24h: float
    price_change_24h: float

class Position(BaseModel):
    id: int
    symbol: str
    side: str
    size: float
    entry_price: float
    stop_loss: float
    take_profit: float
    leverage: int
    is_open: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 