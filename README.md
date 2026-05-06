# Orchestrating Silence: Predictive Acoustic Intelligence

Tacet is a proactive, headless intelligence layer designed for the hospitality sector. It predicts the impact of the external acoustic environment on the guest experience, moving from passive awareness to proactive yield management.

## 🚀 Vision: The Synthetic Acoustic Twin

Tacet has pivoted from a consumer-facing Next.js PWA into a B2B **Synthetic Acoustic Twin**. 

Instead of relying on costly hardware sensors, Tacet builds a physics-based, software-only acoustic model of a hotel property. It acts as an invisible intelligence layer, pushing JSON payloads directly to a hotel's Revenue Management System (RMS) or Property Management System (PMS) to automate operations and pricing based on environmental disruptions.

### How it Works
1. **Proxy Data Ingestion:** The engine continuously ingests APIs for the *causes* of noise: construction permits, traffic flow, weather conditions, and local events.
2. **Spatial Geometry:** Using OpenStreetMap 3D building data, the algorithm calculates acoustic line-of-sight and building shielding.
3. **Proactive Alerts:** Tacet outputs predictive alerts for specific rooms or wings. Example: *"Alert: OpenData Paris shows jackhammering scheduled for 7:00 AM tomorrow outside the East Wing. Recommendation: Reduce booking price by 10% for affected rooms, and automatically reassign VIP guests to the West Wing."*

## 🔗 Synergy with Aetherix

Tacet is designed to work in tandem with [Aetherix](https://github.com/IvandeMurard/aetherix-hospitality-ai), forming a complete **Predictive Digital Twin** for hotels:
*   **Aetherix (Internal Context):** Predicts operational needs, F&B demand, and staffing.
*   **Tacet (External Context):** Predicts environmental impact, street disruptions, and acoustic risks.

Together, they allow hotel operators to control costs, reduce waste, and guarantee an unparalleled guest experience.

## 🏗️ Architecture (V3)

*Currently undergoing architectural pivot.*

*   **Core:** Data pipeline and algorithm engine designed for Python/FastAPI (or dedicated Node backend) to handle complex spatial data calculations and ML integrations.
*   **Data Sources:** OpenData Paris (Construction), TomTom/Google Maps (Traffic), OpenWeatherMap (Weather), OpenStreetMap (3D Geometry).
*   **Integration:** Headless Webhooks/APIs designed for seamless connection to industry-standard PMS/RMS platforms.

---

### Previous Version (V2)

*Note: The Next.js consumer PWA (V2) located in `/tacet` is currently frozen as we shift focus to the V3 backend intelligence layer.*

The V2 Next.js application mapped Bruitparif noise data into a human-readable "Score Sérénité" for Paris. 
- **Tech Stack:** Next.js 15, React 18, MapLibre GL JS, Tailwind CSS.
- **Data Pipeline:** `scripts/build-paris-noise-iris.js` 
