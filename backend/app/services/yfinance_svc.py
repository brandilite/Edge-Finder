import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Any

logger = logging.getLogger(__name__)

_executor = ThreadPoolExecutor(max_workers=4)

# Map our symbols to yfinance ticker symbols
SYMBOL_TO_YF: dict[str, str] = {
    "EURUSD": "EURUSD=X",
    "GBPUSD": "GBPUSD=X",
    "USDJPY": "USDJPY=X",
    "AUDUSD": "AUDUSD=X",
    "USDCAD": "USDCAD=X",
    "USDCHF": "USDCHF=X",
    "NZDUSD": "NZDUSD=X",
    "EURGBP": "EURGBP=X",
    "EURJPY": "EURJPY=X",
    "GBPJPY": "GBPJPY=X",
    "BTCUSD": "BTC-USD",
    "ETHUSD": "ETH-USD",
    "SOLUSD": "SOL-USD",
    "XRPUSD": "XRP-USD",
    "ADAUSD": "ADA-USD",
    "XAUUSD": "GC=F",
    "XAGUSD": "SI=F",
    "USOIL": "CL=F",
    "NGAS": "NG=F",
    "SPX500": "^GSPC",
    "NAS100": "^NDX",
    "US30": "^DJI",
    "UK100": "^FTSE",
    "DE40": "^GDAXI",
}


def _sync_get_price_history(
    symbol: str, period: str = "1y", interval: str = "1d"
) -> list[dict[str, Any]]:
    """Synchronous yfinance call to get price history."""
    import yfinance as yf

    yf_symbol = SYMBOL_TO_YF.get(symbol, symbol)
    ticker = yf.Ticker(yf_symbol)

    try:
        df = ticker.history(period=period, interval=interval)
        if df.empty:
            logger.warning("No price data from yfinance for %s (%s)", symbol, yf_symbol)
            return []

        results = []
        for idx, row in df.iterrows():
            results.append({
                "date": idx.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 6),
                "high": round(float(row["High"]), 6),
                "low": round(float(row["Low"]), 6),
                "close": round(float(row["Close"]), 6),
                "volume": int(row.get("Volume", 0)),
            })
        return results
    except Exception as e:
        logger.error("yfinance price history error for %s: %s", symbol, e)
        return []


def _sync_get_options_chain(symbol: str) -> dict[str, Any]:
    """Synchronous yfinance call to get options chain."""
    import yfinance as yf

    yf_symbol = SYMBOL_TO_YF.get(symbol, symbol)
    ticker = yf.Ticker(yf_symbol)

    try:
        expirations = ticker.options
        if not expirations:
            return {"calls": [], "puts": [], "expirations": []}

        # Get the nearest expiration
        chain = ticker.option_chain(expirations[0])

        calls = []
        if chain.calls is not None and not chain.calls.empty:
            for _, row in chain.calls.iterrows():
                calls.append({
                    "strike": float(row.get("strike", 0)),
                    "lastPrice": float(row.get("lastPrice", 0)),
                    "bid": float(row.get("bid", 0)),
                    "ask": float(row.get("ask", 0)),
                    "volume": int(row.get("volume", 0)) if row.get("volume") else 0,
                    "openInterest": int(row.get("openInterest", 0)) if row.get("openInterest") else 0,
                    "impliedVolatility": float(row.get("impliedVolatility", 0)),
                    "expiration": expirations[0],
                })

        puts = []
        if chain.puts is not None and not chain.puts.empty:
            for _, row in chain.puts.iterrows():
                puts.append({
                    "strike": float(row.get("strike", 0)),
                    "lastPrice": float(row.get("lastPrice", 0)),
                    "bid": float(row.get("bid", 0)),
                    "ask": float(row.get("ask", 0)),
                    "volume": int(row.get("volume", 0)) if row.get("volume") else 0,
                    "openInterest": int(row.get("openInterest", 0)) if row.get("openInterest") else 0,
                    "impliedVolatility": float(row.get("impliedVolatility", 0)),
                    "expiration": expirations[0],
                })

        return {
            "calls": calls,
            "puts": puts,
            "expirations": list(expirations),
        }
    except Exception as e:
        logger.error("yfinance options error for %s: %s", symbol, e)
        return {"calls": [], "puts": [], "expirations": []}


def _sync_get_fundamentals(symbol: str) -> dict[str, Any]:
    """Synchronous yfinance call to get fundamental stats."""
    import yfinance as yf

    yf_symbol = SYMBOL_TO_YF.get(symbol, symbol)
    ticker = yf.Ticker(yf_symbol)

    try:
        info = ticker.info or {}
        return {
            "symbol": symbol,
            "shortName": info.get("shortName", ""),
            "sector": info.get("sector", ""),
            "industry": info.get("industry", ""),
            "marketCap": info.get("marketCap"),
            "trailingPE": info.get("trailingPE"),
            "forwardPE": info.get("forwardPE"),
            "dividendYield": info.get("dividendYield"),
            "beta": info.get("beta"),
            "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh"),
            "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow"),
            "averageVolume": info.get("averageVolume"),
            "trailingEps": info.get("trailingEps"),
            "priceToBook": info.get("priceToBook"),
        }
    except Exception as e:
        logger.error("yfinance fundamentals error for %s: %s", symbol, e)
        return {"symbol": symbol}


async def get_price_history(
    symbol: str, period: str = "1y", interval: str = "1d"
) -> list[dict[str, Any]]:
    """Async wrapper for yfinance price history."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        _executor, _sync_get_price_history, symbol, period, interval
    )


async def get_options_chain(symbol: str) -> dict[str, Any]:
    """Async wrapper for yfinance options chain."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, _sync_get_options_chain, symbol)


async def get_fundamentals(symbol: str) -> dict[str, Any]:
    """Async wrapper for yfinance fundamentals."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, _sync_get_fundamentals, symbol)
