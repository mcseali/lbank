from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import List, Optional
import models
import schemas
import auth
from database import engine, get_db
import os
from dotenv import load_dotenv
import hmac
import hashlib
import time
import requests
import json
from openai import OpenAI
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache
from redis import asyncio as aioredis
import logging
from logging.handlers import RotatingFileHandler
from fastapi_limiter import Limiter
from fastapi_limiter.depends import get_remote_address

# ایجاد جداول دیتابیس
models.Base.metadata.create_all(bind=engine)

load_dotenv()

app = FastAPI(
    title="LBank Trading Bot API",
    description="API for LBank Trading Bot with AI-powered market analysis",
    version="1.0.0"
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
handler = RotatingFileHandler('app.log', maxBytes=10000000, backupCount=5)
logger.addHandler(handler)

# تنظیمات CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# تنظیمات API صرافی LBank
LBANK_API_KEY = os.getenv("LBANK_API_KEY")
LBANK_SECRET_KEY = os.getenv("LBANK_SECRET_KEY")
LBANK_BASE_URL = "https://api.lbank.com"

# تنظیمات OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

# Configure rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.on_event("startup")
async def startup():
    # Initialize Redis cache
    redis = aioredis.from_url("redis://localhost", encoding="utf8", decode_responses=True)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    
    # Initialize database connection pool
    await get_db()
    
    # Start background tasks
    background_tasks.add_task(update_market_data)
    background_tasks.add_task(process_trading_signals)

@app.on_event("shutdown")
async def shutdown():
    await get_db().close()

# API‌های احراز هویت
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = auth.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    db_user = auth.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )
    return auth.create_user(db=db, user=user)

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(
    current_user: models.User = Depends(auth.get_current_active_user)
):
    return current_user

@app.put("/users/me/", response_model=schemas.User)
async def update_user_me(
    user_update: schemas.User,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    return auth.update_user(db, current_user.id, user_update.dict(exclude_unset=True))

@app.get("/users/", response_model=List[schemas.User])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.put("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    current_user: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    return {"message": "User activated"}

# API‌های مدیریت API Key
@app.post("/api-keys/", response_model=schemas.APIKey)
async def create_api_key(
    api_key: schemas.APIKeyCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    db_api_key = models.APIKey(**api_key.dict(), user_id=current_user.id)
    db.add(db_api_key)
    db.commit()
    db.refresh(db_api_key)
    return db_api_key

@app.get("/api-keys/", response_model=List[schemas.APIKey])
async def read_api_keys(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    api_keys = db.query(models.APIKey).filter(models.APIKey.user_id == current_user.id).all()
    return api_keys

@app.delete("/api-keys/{api_key_id}")
async def delete_api_key(
    api_key_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    api_key = db.query(models.APIKey).filter(
        models.APIKey.id == api_key_id,
        models.APIKey.user_id == current_user.id
    ).first()
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    db.delete(api_key)
    db.commit()
    return {"message": "API key deleted"}

# API‌های معاملاتی
@app.get("/api/trading-pairs", response_model=List[schemas.TradingPair])
async def get_trading_pairs(
    current_user: models.User = Depends(auth.get_current_active_user)
):
    try:
        response = requests.get(f"{LBANK_BASE_URL}/v2/accuracy.do")
        pairs_data = response.json()
        
        ticker_response = requests.get(f"{LBANK_BASE_URL}/v2/ticker/24hr.do")
        ticker_data = ticker_response.json()
        
        trading_pairs = []
        for pair in pairs_data:
            symbol = pair.get('symbol')
            if symbol in ticker_data:
                ticker = ticker_data[symbol]
                trading_pairs.append({
                    "symbol": symbol,
                    "base_asset": pair.get('baseAsset'),
                    "quote_asset": pair.get('quoteAsset'),
                    "price": float(ticker.get('last', 0)),
                    "volume_24h": float(ticker.get('volume', 0)),
                    "price_change_24h": float(ticker.get('priceChange', 0))
                })
        
        return trading_pairs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در دریافت لیست جفت ارزها: {str(e)}")

@app.get("/api/candlesticks/{symbol}", response_model=List[schemas.Candle])
async def get_candlesticks(
    symbol: str,
    interval: str = "1h",
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    try:
        response = requests.get(f"{LBANK_BASE_URL}/v2/kline.do?symbol={symbol}&size={limit}&time={interval}")
        candlesticks = response.json()
        
        analysis = get_market_analysis(symbol)
        
        formatted_candlesticks = []
        for candle in candlesticks:
            formatted_candle = {
                "timestamp": int(candle[0]),
                "open": float(candle[1]),
                "high": float(candle[2]),
                "low": float(candle[3]),
                "close": float(candle[4]),
                "volume": float(candle[5]),
                "entry_point": False
            }
            
            if analysis.get("entry_candle_timestamp") == int(candle[0]):
                formatted_candle["entry_point"] = True
            
            formatted_candlesticks.append(formatted_candle)
        
        return formatted_candlesticks
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در دریافت داده‌های کندل: {str(e)}")

@app.post("/api/analyze", response_model=schemas.MarketAnalysis)
async def analyze_market(
    symbol: str,
    timeframe: str = "1h",
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_market_analysis(symbol)

@app.post("/api/trade", response_model=schemas.Trade)
async def execute_trade(
    trade: schemas.TradeSignal,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        # دریافت API Key کاربر
        api_key = db.query(models.APIKey).filter(
            models.APIKey.user_id == current_user.id,
            models.APIKey.exchange == "lbank",
            models.APIKey.is_active == True
        ).first()
        
        if not api_key:
            raise HTTPException(status_code=400, detail="لطفاً ابتدا API Key خود را ثبت کنید")
        
        # دریافت تحلیل بازار
        analysis = get_market_analysis(trade.symbol)
        
        if analysis["confidence"] < 70:
            return {"message": "سطح اطمینان برای معامله بسیار پایین است"}
        
        # محاسبه پارامترهای موقعیت
        current_price = float(analysis.get("current_price", 0))
        stop_loss = current_price * (1 - trade.stop_loss_percentage / 100)
        take_profit = current_price * (1 + trade.take_profit_percentage / 100)
        
        # آماده‌سازی پارامترهای سفارش
        params = {
            "api_key": api_key.api_key,
            "timestamp": int(time.time() * 1000),
            "symbol": trade.symbol,
            "type": "MARKET",
            "side": analysis["recommendation"],
            "quantity": trade.size,
            "leverage": trade.leverage
        }
        
        # افزودن امضا
        params["sign"] = generate_signature(params, api_key.secret_key)
        
        # اجرای سفارش
        response = requests.post(f"{LBANK_BASE_URL}/v2/order", json=params)
        order_result = response.json()
        
        # ذخیره اطلاعات معامله
        trade_db = models.Trade(
            user_id=current_user.id,
            symbol=trade.symbol,
            side=analysis["recommendation"],
            size=trade.size,
            entry_price=current_price,
            stop_loss=stop_loss,
            take_profit=take_profit,
            status="OPEN"
        )
        db.add(trade_db)
        db.commit()
        
        return {
            "message": "معامله با موفقیت انجام شد",
            "trade": trade_db,
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در اجرای معامله: {str(e)}")

@app.get("/api/positions", response_model=List[schemas.Position])
async def get_positions(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Trade).filter(
        models.Trade.user_id == current_user.id,
        models.Trade.status == "OPEN"
    ).all()

@app.post("/api/close-position/{position_id}", response_model=schemas.Trade)
async def close_position(
    position_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        # دریافت API Key کاربر
        api_key = db.query(models.APIKey).filter(
            models.APIKey.user_id == current_user.id,
            models.APIKey.exchange == "lbank",
            models.APIKey.is_active == True
        ).first()
        
        if not api_key:
            raise HTTPException(status_code=400, detail="لطفاً ابتدا API Key خود را ثبت کنید")
        
        params = {
            "api_key": api_key.api_key,
            "timestamp": int(time.time() * 1000),
            "position_id": position_id
        }
        params["sign"] = generate_signature(params, api_key.secret_key)
        
        response = requests.post(f"{LBANK_BASE_URL}/v2/position/close", json=params)
        return response.json()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در بستن موقعیت: {str(e)}")

def get_market_analysis(symbol: str) -> dict:
    try:
        response = requests.get(f"{LBANK_BASE_URL}/v2/ticker/24hr?symbol={symbol}")
        market_data = response.json()
        
        trades_response = requests.get(f"{LBANK_BASE_URL}/v2/trades?symbol={symbol}&limit=100")
        trades_data = trades_response.json()
        
        kline_response = requests.get(f"{LBANK_BASE_URL}/v2/kline.do?symbol={symbol}&size=100&time=1h")
        kline_data = kline_response.json()
        
        analysis_prompt = f"""
        تحلیل داده‌های بازار برای {symbol}:
        قیمت فعلی: {market_data.get('last')}
        حجم معاملات: {market_data.get('volume')}
        تغییر قیمت: {market_data.get('priceChange')}%
        
        معاملات اخیر: {json.dumps(trades_data[:5])}
        
        کندل‌های اخیر: {json.dumps(kline_data[-5:])}
        
        بر اساس این داده‌ها، یک توصیه معاملاتی با فرمت زیر ارائه دهید:
        {{
            "recommendation": "BUY" یا "SELL",
            "confidence": 0-100,
            "reasoning": "توضیح مختصر",
            "entry_candle_timestamp": timestamp کندل ورود
        }}
        """
        
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "شما یک تحلیلگر حرفه‌ای معاملات ارز دیجیتال هستید."},
                {"role": "user", "content": analysis_prompt}
            ]
        )
        
        analysis = json.loads(completion.choices[0].message.content)
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در تحلیل بازار: {str(e)}")

def generate_signature(params: dict, secret_key: str) -> str:
    sorted_params = sorted(params.items())
    query_string = "&".join([f"{k}={v}" for k, v in sorted_params])
    return hmac.new(secret_key.encode(), query_string.encode(), hashlib.sha256).hexdigest()

# Cached market data endpoint
@app.get("/api/market/data/{symbol}")
@cache(expire=30)  # Cache for 30 seconds
@limiter.limit("60/minute")  # Rate limit
async def get_market_data(symbol: str):
    try:
        data = await trading.get_market_data(symbol)
        return data
    except Exception as e:
        logger.error(f"Error getting market data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Optimized trading endpoints with background tasks
@app.post("/api/trading/order")
async def create_order(order: OrderCreate, background_tasks: BackgroundTasks):
    try:
        # Validate order parameters
        if not trading.validate_order(order):
            raise HTTPException(status_code=400, detail="Invalid order parameters")
            
        # Process order in background
        background_tasks.add_task(trading.process_order, order)
        return {"status": "Order processing started"}
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Batch operations for better performance
@app.post("/api/trading/orders/batch")
async def create_orders_batch(orders: List[OrderCreate]):
    try:
        results = await trading.process_orders_batch(orders)
        return results
    except Exception as e:
        logger.error(f"Error processing batch orders: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "database": await get_db().is_connected(),
        "cache": await FastAPICache.is_connected()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 