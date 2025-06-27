# backend/app.py

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import uuid
from math import radians, sin, cos, sqrt, atan2
import openai

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

# --- Helper functions and other routes (These are complete and correct) ---
def load_db():
    with open('database.json', 'r') as f:
        return json.load(f)

def save_db(db):
    with open('database.json', 'w') as f:
        json.dump(db, f, indent=2)

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
def index():
    return "CarbonCapture API is running!"

@app.route('/api/producers', methods=['GET'])
def get_all_producers():
    db = load_db()
    return jsonify(db['producers'])

@app.route('/api/producers', methods=['POST'])
def add_producer():
    data = request.get_json()
    db = load_db()
    new_producer = {
        "id": f"prod_{uuid.uuid4()}", "name": data['name'], "location": data['location'],
        "co2_supply_tonnes_per_week": data['co2_supply_tonnes_per_week']
    }
    db['producers'].append(new_producer)
    save_db(db)
    return jsonify({"message": "Producer added successfully", "producer": new_producer}), 201

@app.route('/api/consumers', methods=['POST'])
def add_consumer():
    data = request.get_json()
    db = load_db()
    new_consumer = {
        "id": f"cons_{uuid.uuid4()}", "name": data['name'], "industry": data['industry'],
        "location": data['location'], "co2_demand_tonnes_per_week": data['co2_demand_tonnes_per_week']
    }
    db['consumers'].append(new_consumer)
    save_db(db)
    return jsonify({"message": "Consumer added successfully", "consumer": new_consumer}), 201

@app.route('/api/matches', methods=['GET'])
def get_matches():
    producer_id = request.args.get('producer_id')
    if not producer_id: return jsonify({"error": "producer_id parameter is required"}), 400
    db = load_db()
    producer = next((p for p in db['producers'] if p['id'] == producer_id), None)
    if not producer: return jsonify({"error": "Producer not found"}), 404
    producer_loc = producer['location']
    matches = []
    for consumer in db['consumers']:
        consumer_loc = consumer['location']
        distance = haversine(producer_loc['lat'], producer_loc['lon'], consumer_loc['lat'], consumer_loc['lon'])
        if consumer['co2_demand_tonnes_per_week'] <= producer['co2_supply_tonnes_per_week']:
            match_data = consumer.copy()
            match_data['distance_km'] = round(distance, 2)
            matches.append(match_data)
    sorted_matches = sorted(matches, key=lambda x: x['distance_km'])
    return jsonify(sorted_matches)

# --- THIS IS THE UPGRADED AI ANALYSIS ENDPOINT ---
@app.route('/api/analyze-matches', methods=['POST'])
def analyze_matches():
    data = request.get_json()
    producer = data.get('producer')
    matches = data.get('matches')

    if not producer or not matches:
        return jsonify({"error": "Producer and matches data are required"}), 400

    try:
        # NEW, ADVANCED PROMPT
        prompt_content = f"""
        You are an expert supply chain and sustainability consultant. Your task is to analyze potential partnerships for a CO2 producer.

        The Producer:
        - Name: "{producer['name']}"
        - Location: {producer['location']}
        - Weekly CO2 Supply: {producer['co2_supply_tonnes_per_week']} tonnes

        The Potential Consumers (Matches):
        {json.dumps(matches, indent=2)}

        Your analysis must be returned as a single JSON object with two top-level keys: "overall_summary" and "ranked_matches".

        1.  "overall_summary": Write a 2-3 sentence executive summary of the producer's market opportunities based on the provided matches.
        2.  "ranked_matches": An array of the consumer objects, re-ordered from the best opportunity (rank 1) to the worst. For each object in the array, add a new key called "analysis" which contains another object with the following three keys:
            - "rank": The numerical rank of this opportunity (e.g., 1, 2, 3).
            - "justification": A detailed paragraph explaining WHY this match received its rank. Consider all factors: distance (logistics, cost, emissions), volume matching (does the consumer's demand match the producer's supply well?), and industry synergy (e.g., concrete is a great use, beverage carbonation is lower value).
            - "strategic_considerations": An array of 2 short, bullet-point style strings highlighting key decision factors or risks for this partnership.
        """

        response = client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT_NAME,
            messages=[
                {"role": "system", "content": "You are an expert supply chain and sustainability consultant providing data in a strict JSON format."},
                {"role": "user", "content": prompt_content}
            ],
            temperature=0.7,
            max_tokens=2500,
            response_format={ "type": "json_object" }
        )

        analysis_json = json.loads(response.choices[0].message.content)

        return jsonify(analysis_json)

    except Exception as e:
        print(f"An Azure OpenAI error occurred: {e}")
        return jsonify({"error": "Failed to get AI analysis."}), 500

# --- Run the App ---
if __name__ == '__main__':
    app.run(debug=True)