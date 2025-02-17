# -*- coding: utf-8 -*-
"""
Created on Tue Dec 17 13:28:19 2024

@author: Speculum Analytics
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_talisman import Talisman
from transformers import pipeline
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

app = Flask(__name__)

# Configure Flask-CORS for Cross-Origin Resource Sharing
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configure Talisman for security AFTER CORS
csp = {
    'default-src': "'self'",
    'script-src': ["'self'", "https://cdn.jsdelivr.net"],  # Add trusted script sources if needed
    'connect-src': ["'self'", "https://bipode-3ce18492867a.herokuapp.com"],  # Your API server
}
Talisman(app, content_security_policy=csp, force_https=True)

# Initialize NLP models
nltk.download("vader_lexicon")
sia = SentimentIntensityAnalyzer()
transformer_pipeline = pipeline("sentiment-analysis")

@app.route('/analyze', methods=['OPTIONS', 'POST'])
def analyze_sentiment():
    # Handle OPTIONS request (preflight)
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return response, 200

    # Handle POST request
    if request.method == 'POST':
        data = request.json
        text = data.get("text", "")

        if not text:
            return jsonify({"error": "No text provided"}), 400

        sentences = text.split('.')
        no_positive, no_negative, no_neutral = 0, 0, 0
        sum_positive, sum_negative, sum_neutral = 0, 0, 0

        for sentence in sentences:
            if sentence.strip():
                scores = sia.polarity_scores(sentence)
                compound = scores['compound']

                # Categorize based on compound score
                if compound > 0.05:
                    no_positive += 1
                    sum_positive += compound
                elif compound < -0.05:
                    no_negative += 1
                    sum_negative += compound
                else:
                    no_neutral += 1
                    sum_neutral += compound

        # Avoid division by zero
        avg_positive = sum_positive / no_positive if no_positive > 0 else 0
        avg_negative = sum_negative / no_negative if no_negative > 0 else 0
        avg_neutral = sum_neutral / no_neutral if no_neutral > 0 else 0

        # Polarization score
        polarization = ((avg_positive - avg_negative) ** 2) 
        # Overall sentiment score
        overall_sentiment = avg_positive + avg_negative
        response = {
            "no_positive": no_positive,
            "no_negative": no_negative,
            "no_neutral": no_neutral,
            "sum_positive": sum_positive,
            "sum_negative": sum_negative,
            "sum_neutral": sum_neutral,
            "avg_positive": avg_positive,
            "avg_negative": avg_negative,
            "avg_neutral": avg_neutral,
            "polarization_score": polarization,
            "overall_sentiment": overall_sentiment
        }

        result = jsonify(response)
        result.headers["Access-Control-Allow-Origin"] = "*"
        return result

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
