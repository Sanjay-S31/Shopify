from flask import Flask, request, jsonify
from sample import get_similar_products  # Import the function
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
app = Flask(__name__)
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

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)