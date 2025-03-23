import os
import time
import hmac
import hashlib
import requests
from typing import Dict, List, Optional
from datetime import datetime
import pandas as pd
import numpy as np
from ta.trend import SMAIndicator, EMAIndicator
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Configuration
LBANK_BASE_URL = os.getenv("LBANK_BASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def generate_signature(params: Dict, secret_key: str) -> str:
    """Generate signature for LBank API requests"""
    sorted_params = sorted(params.items())
    query_string = "&".join([f"{k}={v}" for k, v in sorted_params])
    signature = hmac.new(
        secret_key.encode('utf-8'),
        query_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return signature

def get_trading_pairs() -> List[Dict]:
    """Get available trading pairs from LBank"""
    try:
        response = requests.get(f"{LBANK_BASE_URL}/v2/accuracy.do")
        return response.json()
    except Exception as e:
        raise Exception(f"Error fetching trading pairs: {str(e)}")

def get_candlesticks(symbol: str, interval: str = "1h", limit: int = 100) -> List[Dict]:
    """Get candlestick data from LBank"""
    try:
        response = requests.get(
            f"{LBANK_BASE_URL}/v2/kline.do",
            params={
                "symbol": symbol,
                "size": limit,
                "time": interval
            }
        )
        return response.json()
    except Exception as e:
        raise Exception(f"Error fetching candlesticks: {str(e)}")

def calculate_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate technical indicators for market analysis"""
    # Convert timestamp to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    
    # Calculate SMA
    sma_20 = SMAIndicator(close=df['close'], window=20)
    sma_50 = SMAIndicator(close=df['close'], window=50)
    df['sma_20'] = sma_20.sma_indicator()
    df['sma_50'] = sma_50.sma_indicator()
    
    # Calculate EMA
    ema_20 = EMAIndicator(close=df['close'], window=20)
    df['ema_20'] = ema_20.ema_indicator()
    
    # Calculate RSI
    rsi = RSIIndicator(close=df['close'])
    df['rsi'] = rsi.rsi()
    
    # Calculate Bollinger Bands
    bb = BollingerBands(close=df['close'])
    df['bb_high'] = bb.bollinger_hband()
    df['bb_low'] = bb.bollinger_lband()
    
    return df

def analyze_market_data(df: pd.DataFrame) -> Dict:
    """Analyze market data using technical indicators"""
    # Calculate indicators
    df = calculate_technical_indicators(df)
    
    # Get latest values
    latest = df.iloc[-1]
    prev = df.iloc[-2]
    
    # Analyze trends
    trend = "bullish" if latest['close'] > latest['sma_20'] > latest['sma_50'] else "bearish"
    
    # Analyze momentum
    momentum = "overbought" if latest['rsi'] > 70 else "oversold" if latest['rsi'] < 30 else "neutral"
    
    # Analyze volatility
    volatility = "high" if latest['close'] > latest['bb_high'] or latest['close'] < latest['bb_low'] else "low"
    
    return {
        "trend": trend,
        "momentum": momentum,
        "volatility": volatility,
        "current_price": latest['close'],
        "rsi": latest['rsi'],
        "sma_20": latest['sma_20'],
        "sma_50": latest['sma_50']
    }

def get_ai_analysis(symbol: str, technical_analysis: Dict) -> Dict:
    """Get AI-powered market analysis using ChatGPT"""
    prompt = f"""
    Analyze the following market data for {symbol}:
    
    Technical Analysis:
    - Trend: {technical_analysis['trend']}
    - Momentum: {technical_analysis['momentum']}
    - Volatility: {technical_analysis['volatility']}
    - Current Price: {technical_analysis['current_price']}
    - RSI: {technical_analysis['rsi']}
    - SMA 20: {technical_analysis['sma_20']}
    - SMA 50: {technical_analysis['sma_50']}
    
    Please provide:
    1. Market sentiment (bullish/bearish/neutral)
    2. Confidence level (0-100)
    3. Recommended action (buy/sell/hold)
    4. Key support and resistance levels
    5. Risk assessment
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional cryptocurrency trading analyst."},
                {"role": "user", "content": prompt}
            ]
        )
        
        analysis = response.choices[0].message.content
        
        # Parse the analysis
        sentiment = "bullish" if "bullish" in analysis.lower() else "bearish" if "bearish" in analysis.lower() else "neutral"
        confidence = int(''.join(filter(str.isdigit, analysis.split("Confidence level:")[1].split("\n")[0])))
        recommendation = "buy" if "buy" in analysis.lower() else "sell" if "sell" in analysis.lower() else "hold"
        
        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "recommendation": recommendation,
            "analysis": analysis
        }
    except Exception as e:
        raise Exception(f"Error getting AI analysis: {str(e)}")

def execute_trade(
    symbol: str,
    side: str,
    quantity: float,
    leverage: int,
    api_key: str,
    secret_key: str
) -> Dict:
    """Execute a trade on LBank"""
    try:
        # Prepare order parameters
        params = {
            "api_key": api_key,
            "timestamp": int(time.time() * 1000),
            "symbol": symbol,
            "type": "MARKET",
            "side": side.upper(),
            "quantity": quantity,
            "leverage": leverage
        }
        
        # Generate signature
        params["sign"] = generate_signature(params, secret_key)
        
        # Send order
        response = requests.post(f"{LBANK_BASE_URL}/v2/order.do", params=params)
        return response.json()
    except Exception as e:
        raise Exception(f"Error executing trade: {str(e)}")

def close_position(
    symbol: str,
    position_id: str,
    api_key: str,
    secret_key: str
) -> Dict:
    """Close a position on LBank"""
    try:
        # Prepare close parameters
        params = {
            "api_key": api_key,
            "timestamp": int(time.time() * 1000),
            "symbol": symbol,
            "position_id": position_id
        }
        
        # Generate signature
        params["sign"] = generate_signature(params, secret_key)
        
        # Send close request
        response = requests.post(f"{LBANK_BASE_URL}/v2/close_position.do", params=params)
        return response.json()
    except Exception as e:
        raise Exception(f"Error closing position: {str(e)}")

def get_positions(api_key: str, secret_key: str) -> List[Dict]:
    """Get open positions from LBank"""
    try:
        # Prepare request parameters
        params = {
            "api_key": api_key,
            "timestamp": int(time.time() * 1000)
        }
        
        # Generate signature
        params["sign"] = generate_signature(params, secret_key)
        
        # Get positions
        response = requests.get(f"{LBANK_BASE_URL}/v2/positions", params=params)
        return response.json()
    except Exception as e:
        raise Exception(f"Error fetching positions: {str(e)}") 