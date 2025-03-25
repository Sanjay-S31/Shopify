import json
import time
import os
import certifi
import base64
import numpy as np
import tensorflow as tf

from tensorflow.keras.applications import EfficientNetV2L
from tensorflow.keras.applications.efficientnet_v2 import preprocess_input, decode_predictions
from tensorflow.keras.models import load_model

from PIL import Image
from io import BytesIO

from pymongo import MongoClient
from llama_index.readers.mongodb import SimpleMongoReader
from llama_index.core import VectorStoreIndex, Document, Settings
from llama_index.core.response_synthesizers import get_response_synthesizer
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.embeddings.openai import OpenAIEmbedding  # type: ignore
from dotenv import load_dotenv
from bson import ObjectId
from flask import Flask, jsonify

load_dotenv()

MODEL = EfficientNetV2L(weights='imagenet')

# MongoDB Atlas connection
uri = os.getenv("MONGODB_URL")
client = MongoClient(uri, tlsCAFile=certifi.where())
reader = SimpleMongoReader(uri=uri)


def chatbot_query(query):
    print(f"Processing query: {query}")
    
    try:
        # Configure database and collection
        db = client["EcommerceDB"]
        products_collection = db["products"]
        
        # Prepare query text
        query_text = f"Return a JSON response with key as abcd to the question after retrieving : {query}. if you dont know reply i dont know"
        
        # Load product fields
        product_fields = ["_id", "productName", "productType", "description", "cost", "tags", "inCart","quantity"]
        products_docs = reader.load_data("EcommerceDB", "products", field_names=product_fields)
        
        # Create index and query engine
        index = VectorStoreIndex.from_documents(products_docs)
        retriever = VectorIndexRetriever(index=index, similarity_top_k=100)
        response_synthesizer = get_response_synthesizer(response_mode="compact")
        query_engine = RetrieverQueryEngine(retriever=retriever, response_synthesizer=response_synthesizer)
        
        print("[DEBUG] Calling OpenAI API for similarity search...")
        start_time = time.time()
        response = query_engine.query(query_text)
        end_time = time.time()
        
        print(f"OpenAI API call completed in {end_time - start_time:.2f} seconds.")
        try:
            res = json.loads(response.response)  
            print(res)
            if not isinstance(res, str):
                recommended_products = ""  
        except json.JSONDecodeError:
            recommended_products = ""  # Handle case where response isn't valid JSON

        return {"recommend": res}
    except Exception as e:
        print(f"[ERROR] An error occurred: {e}")
        return {"error": str(e)}
    
        
        
    
def get_similar_products(product_ids):
    print("Recieved Product IDs: ",product_ids)
    """
    Retrieves similar products based on tags of the given product IDs.
    """

    if not product_ids:
        return {"error": "No product IDs received"}

    try:
        # Fetch tags for the given product IDs
        db = client["EcommerceDB"]
        products_collection = db["products"]
        databases = client.list_database_names()
        collections = db.list_collection_names()
        tags = set()
        for product_id in product_ids:
            product = products_collection.find_one({"_id": ObjectId(product_id)}, {"tags": 1})
            if product and "tags" in product:
                # Split and clean up tags from comma-separated string
                product_tags = product["tags"].split(",")
                tags.update(tag.strip() for tag in product_tags)
        if not tags:
            return {"error": "No tags found for the provided products."}

        # Convert tags into a query string
        query_text = f"Return a JSON array of product_ids where the tags match: {', '.join(tags)}. Only include the product_ids in the response."

        # Load data from 'products' collection
        product_fields = ["_id", "productName", "productType", "description", "cost", "tags"]
        products_docs = reader.load_data("EcommerceDB", "products", field_names=product_fields)

        # Create an index from product documents
        index = VectorStoreIndex.from_documents(products_docs)

        # Querying similar products
        retriever = VectorIndexRetriever(index=index, similarity_top_k=100)
        response_synthesizer = get_response_synthesizer(response_mode="compact")
        query_engine = RetrieverQueryEngine(retriever=retriever, response_synthesizer=response_synthesizer)

        print("[DEBUG] Calling OpenAI API for similarity search...")
        start_time = time.time()
        response = query_engine.query(query_text)

        end_time = time.time()
        print(f"OpenAI API call completed in {end_time - start_time:.2f} seconds.")

         # Ensure response is a JSON array
        try:
            recommended_products = json.loads(response.response)  # Convert string to list
            print(recommended_products)
            if not isinstance(recommended_products, list):
                recommended_products = []  # Ensure it is always a list
        except json.JSONDecodeError:
            recommended_products = []  # Handle case where response isn't valid JSON

        return {"recommended_products": recommended_products}

    except Exception as e:
        print(f"[ERROR] An error occurred: {e}")
        return {"error": str(e)}


# IMAGE RECOGNITION

def decode_base64_image(base64_string):
    """
    Decode base64 image string to PIL Image
    """
    # Remove data URI prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Decode base64 to image
    image_bytes = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_bytes))
    
    return image

def preprocess_image(image):
    """
    Preprocess image for EfficientNetV2L model
    """
    # Resize image to 480x480 (EfficientNetV2L's input size)
    image = image.resize((480, 480))
    
    # Convert to numpy array and normalize
    img_array = image.convert('RGB')
    img_array = np.array(img_array)
    
    # Add batch dimension and preprocess
    img_array = preprocess_input(
        np.expand_dims(img_array, axis=0)
    )
    
    return img_array

def predict_image_class(preprocessed_image):
    """
    Predict the class of the image using EfficientNetV2L
    """
    # Make prediction
    predictions = MODEL.predict(preprocessed_image)
    
    # Decode predictions
    decoded_predictions = decode_predictions(predictions, top=3)[0]
    
    # Return top 3 predictions
    top_predictions = [
        {
            'class_name': pred[1],
            'confidence': float(pred[2])
        } for pred in decoded_predictions
    ]
    
    return top_predictions

# Example usage in Flask route
def search_image(base64_image):
    try:
        # Decode base64 image
        image = decode_base64_image(base64_image)
        
        # Preprocess image
        preprocessed_image = preprocess_image(image)
        
        # Predict image class
        results = predict_image_class(preprocessed_image)
        
        return {
            'predictions': results
        }
    except Exception as e:
        return {'error': str(e)}
