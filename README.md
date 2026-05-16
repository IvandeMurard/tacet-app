# Tacet: Predictive Environmental & Contextual Intelligence Engine

Tacet is an advanced, headless AI engine built for the luxury hospitality sector. It acts as the sentient analytical layer between external environmental data (City Open Data, Weather, Traffic, Events) and Hotel Operations (Property Management Systems and Revenue Management Systems).

While initially designed as an **Acoustic Ray-Tracing Engine** to predict construction noise propagation in dense urban environments (Paris), Tacet has evolved into a comprehensive **Contextual Intelligence Engine** capable of anticipating strikes, extreme weather, and massive crowd movements.

## 🏗 Core Architecture & Engineering Highlights

This repository was architected to demonstrate modern, highly-scalable backend AI engineering patterns:

### 1. 3D Spatial Physics Engine (Acoustics)
- **Ray-Tracing:** Uses `shapely` and `osmnx` to draw mathematical lines of sight between a disruptive event (e.g., a jackhammer or a stadium concert) and the target hotel.
- **Physical Shielding:** Cross-references the ray-trace against 3D urban building polygons. If a building intersects the line of sight, a dynamic `-15 dB` shielding penalty is applied to the inverse-square law attenuation formula.

### 2. Dual Memory Systems (Idiosyncratic & Hive Mind)
Tacet is not a stateless script; it possesses a learning feedback loop powered by `SQLAlchemy` and `SQLite`.
- **Idiosyncratic Memory (Local):** If a specific hotel's manager repeatedly rejects an automated alert for "Traffic Noise," Tacet learns that this specific building likely has triple-glazed windows. It automatically applies a persistent `+2.0 dB` shielding bonus for future calculations at that exact GPS coordinate.
- **Hive Mind (Global):** A statistical aggregation engine (`app/services/hive_mind.py`) constantly analyzes rejection rates across the entire global network of hotels to dynamically adjust baseline ecosystem sensitivities.

### 3. Agentic & "Headless" Protocol (MCP Ready)
Tacet has no graphical user interface. It is built to be consumed by LLM Orchestrators (like Aetherix) or direct machine-to-machine integrations.
- **Explainability Chains:** To guarantee transparency in a headless system, every JSON payload includes a mathematical "Chain of Thought" (`explainability_chain`), allowing an LLM to read the raw data and explain the physics to a human in natural language.

### 4. Enterprise Integrations & The HITL Guardrail
Tacet adheres strictly to a **Human-In-The-Loop (HITL)** philosophy. It never executes autonomous destructive actions.
- **Native PMS Tasks:** Implements OAuth2 and secure connectors (`mews_client.py`, `apaleo_client.py`) to push `CRITICAL` warnings directly into the hotel staff's operational dashboard as native tasks.
- **The RMS Contract:** Generates universal Yield Management rules (`TacetRMSPayload`) designed for immediate ingestion by systems like Duetto or Atomize (e.g., *"-15% price modifier for Street Facing Suites between June 12-14"*).

## 🔌 Data Ingestion Ecosystem

Tacet ingests and standardizes chaotic external data into actionable intelligence:
- **Planned Construction:** Paris Open Data (Predictive date filtering)
- **Crowd Events:** "Que Faire à Paris" API (Stadium/Concert noise)
- **Real-Time Traffic:** TomTom API Congestion ratios
- **Logistical Disruptions:** Transit Strikes (RATP) & Extreme Weather Alerts

## 🚀 Tech Stack

- **Framework:** Python 3.12, FastAPI
- **Database:** SQLAlchemy / SQLite
- **Spatial Math:** OSMnx, Shapely, GeoPandas
- **Deployment:** Stateless webhook dispatching architecture

## 🧪 How to Test Locally

Tacet is a headless engine. The easiest way to test its capabilities is via the auto-generated Swagger UI.

1. **Install dependencies:**
   ```bash
   pip install fastapi uvicorn requests shapely osmnx geopandas sqlalchemy
   ```
2. **Start the server:**
   ```bash
   uvicorn app.main:app --reload
   ```
3. **Run a Predictive Forecast:**
   Open your browser and navigate to `http://127.0.0.1:8000/docs`. 
   Use the `POST /api/v1/forecast` endpoint with the following test payload:
   ```json
   {
     "hotel_id": "TEST_PARIS_1",
     "coordinates": {
       "lat": 48.8786,
       "lon": 2.3771
     },
     "start_date": "2026-06-01",
     "end_date": "2026-06-15"
   }
   ```
   *Look at the `explainability_chain` in the response to see the Ray-Tracing math in action!*

## 💡 Use Case Example

**The Problem:** A massive music festival is planned 800 meters from a luxury hotel next July.
**Tacet's Execution:**
1. Fetches the event via the Event API.
2. Calculates that the concert will generate `100 dB` of noise at the source.
3. Performs a 3D Ray-Trace and confirms no buildings block the sound path.
4. Queries the Idiosyncratic DB and sees this hotel has standard windows.
5. Calculates the sound wave will hit the hotel at `55 dB` (Highly Disruptive).
6. Dispatches a JSON payload to the RMS recommending a `-10% Price Yield` on street-facing rooms, while pushing a Task to the Apaleo PMS reminding the front desk to order earplugs. 
