# backend/app.py - FINAL CORRECTED VERSION

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

# --- Helper Functions ---
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

# --- API Endpoints ---
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

@app.route('/api/analyze-matches', methods=['POST'])
def analyze_matches():
    data = request.get_json()
    producer = data.get('producer')
    matches = data.get('matches')
    if not producer or not matches:
        return jsonify({"error": "Producer and matches data are required"}), 400
    try:
        # THIS IS THE FULL, UNABBREVIATED PROMPT
        prompt_content = f"""
        You are an expert supply chain and sustainability consultant. Your task is to analyze potential partnerships for a CO2 producer.
        Analyze the following data and provide your response as a single, valid JSON object and nothing else. Do not include any text before or after the JSON object.

        The Producer:
        - Name: "{producer['name']}"
        - Weekly CO2 Supply: {producer['co2_supply_tonnes_per_week']} tonnes

        The Potential Consumers (Matches):
        {json.dumps(matches, indent=2)}

        Your JSON response must have two top-level keys: "overall_summary" and "ranked_matches".
        1.  "overall_summary": A 2-3 sentence executive summary of the producer's market opportunities based on the provided matches.
        2.  "ranked_matches": An array of the consumer objects you were given, re-ordered from the best opportunity (rank 1) to the worst. For each object, add a new key called "analysis" containing another object with three keys: "rank", "justification", and "strategic_considerations".
            - "rank": The numerical rank of this opportunity (e.g., 1, 2, 3).
            - "justification": A detailed paragraph explaining WHY this match received its rank. Consider all factors: distance, volume matching, and industry synergy.
            - "strategic_considerations": An array of 2 short, bullet-point style strings highlighting key decision factors or risks.
        """
        
        # THIS IS THE FULL, UNABBREVIATED API CALL
        response = client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT_NAME,
            messages=[
                {"role": "system", "content": "You are an expert supply chain and sustainability consultant providing data in a strict JSON format."},
                {"role": "user", "content": prompt_content}
            ],
            temperature=0.7,
            max_tokens=2500
        )

        analysis_text = response.choices[0].message.content
        if not analysis_text:
            raise Exception("AI returned an empty response.")
        
        final_report = json.loads(analysis_text)
        return jsonify(final_report)

    except Exception as e:
        print(f"An error occurred in analyze-matches: {e}")
        return jsonify({"error": "Failed to get AI analysis."}), 500

@app.route('/api/impact-model', methods=['POST'])
def impact_model():
    data = request.get_json(); producer = data.get('producer'); consumer = data.get('consumer')
    if not producer or not consumer: return jsonify({"error": "Producer and consumer data are required"}), 400
    try:
        carbon_credit_price_per_tonne = 25.00; industrial_co2_price_per_tonne = 75.00; weeks_per_year = 52
        estimated_delivery_emissions_per_100km = 0.05
        tonnes_per_week = min(producer['co2_supply_tonnes_per_week'], consumer['co2_demand_tonnes_per_week'])
        tonnes_per_year = tonnes_per_week * weeks_per_year
        annual_revenue_for_producer = tonnes_per_year * carbon_credit_price_per_tonne
        annual_savings_for_consumer = tonnes_per_year * industrial_co2_price_per_tonne
        estimated_delivery_emissions = (consumer['distance_km'] / 100) * estimated_delivery_emissions_per_100km * weeks_per_year
        net_co2_sequestered = tonnes_per_year - estimated_delivery_emissions
        return jsonify({
            "producer_name": producer['name'], "consumer_name": consumer['name'], "annual_tonnage": round(tonnes_per_year, 2),
            "financials": {"producer_annual_revenue": round(annual_revenue_for_producer, 2), "consumer_annual_savings": round(annual_savings_for_consumer, 2), "carbon_credit_value": round(annual_revenue_for_producer, 2)},
            "environmental": {"co2_diverted": round(tonnes_per_year, 2), "estimated_logistics_emissions": round(estimated_delivery_emissions, 2), "net_co2_impact": round(net_co2_sequestered, 2)}
        })
    except Exception as e:
        print(f"An error occurred in impact-model: {e}")
        return jsonify({"error": "Failed to calculate impact model."}), 500

# --- Run the App ---
if __name__ == '__main__':
    app.run(debug=True)