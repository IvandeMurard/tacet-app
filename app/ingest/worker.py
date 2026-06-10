import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from app.database import SessionLocal
from app.models.db_models import EnvironmentalState, GeoEvent
from app.ingest.paris_permits import fetch_active_permits
from app.ingest.paris_events import fetch_active_events
from app.ingest.weather import fetch_current_weather
from app.ingest.traffic import fetch_traffic_congestion
from app.ingest.transit_strikes import fetch_transit_disruptions
from app.ingest.extreme_weather import fetch_extreme_weather_alerts

logger = logging.getLogger(__name__)

PARIS_LAT = 48.8566
PARIS_LON = 2.3522

def sync_external_data():
    logger.info("Starting background synchronization of external data...")
    db = SessionLocal()
    try:
        db.query(GeoEvent).delete()
        db.query(EnvironmentalState).delete()

        # 1. Weather and Traffic
        weather_data = fetch_current_weather(PARIS_LAT, PARIS_LON)
        weather_condition = weather_data["main"] if weather_data else None

        traffic_data = fetch_traffic_congestion(PARIS_LAT, PARIS_LON)
        congestion_ratio = traffic_data.get("congestion_ratio", 1.0) if traffic_data else 1.0

        env_state = EnvironmentalState(
            lat=PARIS_LAT,
            lon=PARIS_LON,
            weather_condition=weather_condition,
            congestion_ratio=congestion_ratio
        )
        db.add(env_state)

        # 2. Construction Permits
        permits = fetch_active_permits(limit=50)
        for p in (permits or []):
            coords = p.get("coordinates", {})
            sd_str = p.get("start_date")
            ed_str = p.get("end_date")
            
            try:
                sd = datetime.fromisoformat(sd_str.replace("Z", "+00:00")) if sd_str else None
            except:
                sd = None
            try:
                ed = datetime.fromisoformat(ed_str.replace("Z", "+00:00")) if ed_str else None
            except:
                ed = None

            db.add(GeoEvent(
                lat=coords.get("lat"),
                lon=coords.get("lon"),
                event_type="permit",
                description="Construction Permit",
                start_date=sd,
                end_date=ed
            ))

        # 3. Crowd Events
        events = fetch_active_events(limit=50)
        for e in (events or []):
            coords = e.get("coordinates", {})
            sd_str = e.get("start_date")
            try:
                sd = datetime.fromisoformat(sd_str.replace("Z", "+00:00")) if sd_str else None
            except:
                sd = None
                
            db.add(GeoEvent(
                lat=coords.get("lat"),
                lon=coords.get("lon"),
                event_type="crowd_event",
                description=e.get("description", "Crowd Event"),
                start_date=sd,
            ))

        # 4. Transit Strikes
        strikes = fetch_transit_disruptions(PARIS_LAT, PARIS_LON, None, None)
        for s in (strikes or []):
            db.add(GeoEvent(
                lat=PARIS_LAT,
                lon=PARIS_LON,
                event_type=s.get("source_type", "transit_strike"),
                description=s.get("description"),
            ))

        # 5. Extreme Weather
        ext_weather = fetch_extreme_weather_alerts(PARIS_LAT, PARIS_LON, None, None)
        for ew in (ext_weather or []):
            db.add(GeoEvent(
                lat=PARIS_LAT,
                lon=PARIS_LON,
                event_type=ew.get("source_type", "extreme_weather"),
                description=ew.get("description"),
            ))

        db.commit()
        logger.info("Background synchronization completed successfully.")
    except Exception as e:
        logger.error(f"Error during background sync: {e}")
        db.rollback()
    finally:
        db.close()

scheduler = BackgroundScheduler()

def start_scheduler():
    scheduler.add_job(sync_external_data, 'interval', minutes=15, id='sync_external_data', replace_existing=True)
    scheduler.start()
    scheduler.get_job('sync_external_data').modify(next_run_time=datetime.now())

def stop_scheduler():
    scheduler.shutdown()
