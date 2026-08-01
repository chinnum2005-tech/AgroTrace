import json
import urllib.request
import urllib.parse
from datetime import datetime

def fetch_historical_weather_nasa(lat: float, lon: float, start_date: str, end_date: str) -> dict:
    """
    Fetch daily agro-climatology parameters from NASA POWER API
    Parameters:
      - T2M (2m Temperature, C)
      - PRECTOTCORR (Precipitation Corrected, mm/day)
      - RH2M (Relative Humidity at 2m, %)
    """
    # Format dates as YYYYMMDD (NASA POWER format)
    try:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        # Fallback if in ISO format with timestamp
        start_dt = datetime.fromisoformat(start_date.replace("Z", ""))
        end_dt = datetime.fromisoformat(end_date.replace("Z", ""))
        
    start_str = start_dt.strftime("%Y%m%d")
    end_str = end_dt.strftime("%Y%m%d")
    
    url = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point?"
        f"parameters=T2M,PRECTOTCORR,RH2M&community=AG&"
        f"longitude={lon:.4f}&latitude={lat:.4f}&"
        f"start={start_str}&end={end_str}&format=JSON"
    )
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=12) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            t2m_dict = data['properties']['parameter']['T2M']
            precip_dict = data['properties']['parameter']['PRECTOTCORR']
            rh2m_dict = data['properties']['parameter']['RH2M']
            
            if not t2m_dict:
                raise ValueError("No weather parameters returned by NASA POWER")
                
            temps = list(t2m_dict.values())
            rain_days = list(precip_dict.values())
            humidities = list(rh2m_dict.values())
            
            # Aggregate stats
            avg_temp = sum(temps) / len(temps)
            total_rain = sum(rain_days) # total accumulated mm
            avg_humidity = sum(humidities) / len(humidities)
            
            return {
                "temperature": round(avg_temp, 2),
                "rainfall": round(total_rain, 2),
                "humidity": round(avg_humidity, 2),
                "source": "nasa-power"
            }
            
    except Exception as e:
        print(f"Error fetching NASA POWER weather: {e}")
        raise RuntimeError(f"NASA POWER API request failed: {str(e)}")
