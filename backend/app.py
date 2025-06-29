# backend/app.py - FINAL SUBMISSION VERSION

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import uuid
from math import radians, sin, cos, sqrt, atan2
import openai
import requests
from geopy.geocoders import Nominatim

# --- Azure OpenAI Configuration ---
client = openai.AzureOpenAI(
    azure_endpoint="https://VAF-OPEN-AI.openai.azure.com/",
    api_key="d6e3e6f6647346e187a10345841af98f",
    api_version="2024-03-01-preview"
)
AZURE_OPENAI_DEPLOYMENT_NAME = "VAF_OPEN_AI"

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app)

# --- All Helper Functions and other routes are complete and correct ---
def load_db():
    with open('database.json', 'r') as f: return json.load(f)
def save_db(db):
    with open('database.json', 'w') as f: json.dump(db, f, indent=2)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    lat1_rad, lon1_rad, lat2_rad, lon2_rad = map(radians, [lat1, lon1, lat2, lon2])
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = R * c
    return distance

@app.route('/')
def index(): return "CarbonCapture API is running!"
@app.route('/api/geocode', methods=['POST'])
def geocode_address():
    data = request.get_json(); address = data.get('address')
    if not address: return jsonify({"error": "Address is required"}), 400
    try:
        geolocator = Nominatim(user_agent="carbon_marketplace_hackathon"); location = geolocator.geocode(address)
        if location: return jsonify({"lat": location.latitude, "lon": location.longitude})
        else: return jsonify({"error": "Could not find coordinates for the address."}), 404
    except Exception as e: print(f"Geocoding error: {e}"); return jsonify({"error": "Geocoding service failed."}), 500

@app.route('/api/producers', methods=['GET'])
def get_all_producers():
    db = load_db(); return jsonify(db['producers'])

@app.route('/api/producers', methods=['POST'])
def add_producer():
    data = request.get_json(); db = load_db()
    new_producer = {"id": f"prod_{uuid.uuid4()}", "name": data['name'], "location": data['location'], "co2_supply_tonnes_per_week": data['co2_supply_tonnes_per_week']}
    db['producers'].append(new_producer); save_db(db)
    return jsonify({"message": "Producer added successfully", "producer": new_producer}), 201

@app.route('/api/consumers', methods=['POST'])
def add_consumer():
    data = request.get_json(); db = load_db()
    new_consumer = {"id": f"cons_{uuid.uuid4()}", "name": data['name'], "industry": data['industry'], "location": data['location'], "co2_demand_tonnes_per_week": data['co2_demand_tonnes_per_week']}
    db['consumers'].append(new_consumer); save_db(db)
    return jsonify({"message": "Consumer added successfully", "consumer": new_consumer}), 201

@app.route('/api/matches', methods=['GET'])
def get_matches():
    producer_id = request.args.get('producer_id')
    if not producer_id: return jsonify({"error": "producer_id parameter is required"}), 400
    db = load_db(); producer = next((p for p in db['producers'] if p['id'] == producer_id), None)
    if not producer: return jsonify({"error": "Producer not found"}), 404
    producer_loc = producer['location']; matches = []
    for consumer in db['consumers']:
        consumer_loc = consumer['location']; distance = haversine(producer_loc['lat'], producer_loc['lon'], consumer_loc['lat'], consumer_loc['lon'])
        if consumer['co2_demand_tonnes_per_week'] <= producer['co2_supply_tonnes_per_week']:
            match_data = consumer.copy(); match_data['distance_km'] = round(distance, 2); matches.append(match_data)
    sorted_matches = sorted(matches, key=lambda x: x['distance_km']); return jsonify(sorted_matches)


# --- AI Analysis Endpoint (New, More Reliable Strategy) ---
@app.route('/api/analyze-matches', methods=['POST'])
def analyze_matches():
    data = request.get_json()
    producer = data.get('producer')
    matches = data.get('matches')
    if not producer or not matches:
        return jsonify({"error": "Producer and matches data are required"}), 400

    analyzed_matches = []
    # We now loop through each match and make a small, separate AI call for each one.
    for i, match in enumerate(matches):
        try:
            # This is a much simpler prompt for the AI to handle
            prompt_content = f"""
            You are a sustainability business analyst. Given the following CO2 Producer and a potential Consumer, provide a brief analysis.

            Producer:
            - Name: "{producer['name']}"
            - Weekly CO2 Supply: {producer['co2_supply_tonnes_per_week']} tonnes

            Consumer:
            - Name: "{match['name']}"
            - Industry: "{match['industry']}"
            - Weekly CO2 Demand: {match['co2_demand_tonnes_per_week']} tonnes
            - Distance: {match['distance_km']} km

            Your response must be a single, valid JSON object with two keys: "justification" and "strategic_considerations".
            - "justification": A concise paragraph explaining why this is or is not a good partnership.
            - "strategic_considerations": An array of 2 short bullet-point style strings highlighting key decision factors.
            """
            response = client.chat.completions.create(
                model=AZURE_OPENAI_DEPLOYMENT_NAME,
                messages=[
                    {"role": "system", "content": "You are an expert analyst providing data in a strict JSON format."},
                    {"role": "user", "content": prompt_content}
                ],
                temperature=0.5,
                max_tokens=500
            )
            analysis_text = response.choices[0].message.content
            if not analysis_text: raise Exception("AI returned empty content")
            
            analysis_json = json.loads(analysis_text)
            
            # Add the analysis and rank to the match object
            match['analysis'] = {
                "rank": i + 1,
                "justification": analysis_json.get("justification", "N/A"),
                "strategic_considerations": analysis_json.get("strategic_considerations", [])
            }
        except Exception as e:
            # If a single AI call fails, we still add the match with a fallback message
            print(f"AI call failed for match {match['name']}: {e}")
            match['analysis'] = {
                "rank": i + 1,
                "justification": "AI analysis for this specific opportunity is currently unavailable.",
                "strategic_considerations": []
            }
        
        analyzed_matches.append(match)

    final_report = {
        "overall_summary": f"Found {len(analyzed_matches)} potential partners for {producer['name']}, sorted by distance. Each has been analyzed for strategic fit.",
        "ranked_matches": analyzed_matches
    }

    return jsonify(final_report)


# ... (impact_model endpoint and __main__ block are unchanged) ...
@app.route('/api/impact-model', methods=['POST'])
def impact_model(): ...
if __name__ == '__main__':
    app.run(debug=True)