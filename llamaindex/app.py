from flask import Flask, request, jsonify
import logging
from flask_cors import CORS 
from sample import get_similar_products, chatbot_query, search_image  # Import the function
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
CORS(app)
analyzer = SentimentIntensityAnalyzer()

@app.route("/update-products", methods=["POST"])
def update_products():
    try:
        data = request.json
        user_id = data.get("userId")    
        product_ids = data.get("productIds")

        if not user_id or not product_ids:
            return jsonify({"error": "Missing userId or productIds"}), 400

        #print(f"Updated Product List for User {user_id}: {product_ids}")

        # Call the function directly
        result = get_similar_products(product_ids)
        print(result)
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/analyze-review", methods=["POST"])
def analyze_review():
    try:
        data = request.json
        review = data.get("review", "")  # Extract the review from request

        if not review:
            return jsonify({"error": "Missing review text"}), 400

        # Perform sentiment analysis using VADER
        sentiment_score = analyzer.polarity_scores(review)["compound"]
        sentiment = "neutral"
        if sentiment_score >= 0.05:
            sentiment = "positive"
        elif sentiment_score <= -0.05:
            sentiment = "negative"
        
        return jsonify({"review": review, "sentiment": sentiment, "sentiment_score": sentiment_score}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
logger = logging.getLogger(__name__)

@app.route("/chatbotresponse", methods=["POST"])
def chatreply():
    try:
        # Log the full request for debugging
        logger.info(f"Received chatbot request: {request.json}")

        # Get JSON data with error handling
        data = request.get_json(force=True, silent=True)

        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        user_query = data.get("query", "")

        # Call the chatbot query function with user's query
        result = chatbot_query(user_query)
        return result, 200

    except Exception as e:
        # Log the error details
        logger.error(f"Chatbot response error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/image_search', methods=['POST'])
def image_search():
    
    # Get image from request
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400
    
    try:
        result = search_image(data['image'])

        # Log the result server-side for debugging
        print("Image Search Result:")
        if 'predictions' in result:
            for i, pred in enumerate(result['predictions'], 1):
                print(f"Prediction {i}: {pred['class_name']} (Confidence: {pred['confidence']})")
    
        elif 'error' in result:
            print(f"Error: {result['error']}")

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
