import json
import time
import os
import certifi
import base64
import numpy as np
import tensorflow as tf
import pickle

from tensorflow.keras.models import load_model
from PIL import Image
from io import BytesIO

from pymongo import MongoClient
from llama_index.readers.mongodb import SimpleMongoReader
from llama_index.core import VectorStoreIndex, Document, Settings
from llama_index.core.response_synthesizers import get_response_synthesizer
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.embeddings.openai import OpenAIEmbedding
from dotenv import load_dotenv
from bson import ObjectId
from flask import Flask, jsonify

# Load environment variables
load_dotenv()

# Load custom trained model
MODEL = load_model("ecommerce_cnn_model.h5")

# Load label classes (generated during training)
with open("label_classes.pkl", "rb") as f:
    class_indices = pickle.load(f)

# Reverse the dictionary to map index -> class label
class_labels = {v: k for k, v in class_indices.items()}

# MongoDB Atlas connection
uri = os.getenv("MONGODB_URL")
client = MongoClient(uri, tlsCAFile=certifi.where())
reader = SimpleMongoReader(uri=uri)

# Chatbot query for recommendation
def chatbot_query(query):
    print(f"Processing query: {query}")
    
    try:
        db = client["EcommerceDB"]
        products_collection = db["products"]
        
        query_text = f"Return a JSON response with key as abcd to the question after retrieving : {query}. if you dont know reply i dont know"
        
        product_fields = ["_id", "productName", "productType", "description", "cost", "tags", "inCart", "quantity"]
        products_docs = reader.load_data("EcommerceDB", "products", field_names=product_fields)
        
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
            recommended_products = ""

        return {"recommend": res}
    
    except Exception as e:
        print(f"[ERROR] An error occurred: {e}")
        return {"error": str(e)}

# Get similar products by tags
def get_similar_products(product_ids):
    print("Recieved Product IDs: ", product_ids)

    if not product_ids:
        return {"error": "No product IDs received"}

    try:
        db = client["EcommerceDB"]
        products_collection = db["products"]
        tags = set()
        
        for product_id in product_ids:
            product = products_collection.find_one({"_id": ObjectId(product_id)}, {"tags": 1})
            if product and "tags" in product:
                product_tags = product["tags"].split(",")
                tags.update(tag.strip() for tag in product_tags)

        if not tags:
            return {"error": "No tags found for the provided products."}

        query_text = f"Return a JSON array of product_ids where the tags match any of these: {', '.join(tags)}. Only include the product_ids in the response."

        product_fields = ["_id", "productName", "productType", "description", "cost", "tags"]
        products_docs = reader.load_data("EcommerceDB", "products", field_names=product_fields)

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
            recommended_products = json.loads(response.response)
            print(recommended_products)
            if not isinstance(recommended_products, list):
                recommended_products = []
        except json.JSONDecodeError:
            recommended_products = []

        return {"recommended_products": recommended_products,"elsecase":product_ids}

    except Exception as e:
        print(f"[ERROR] An error occurred: {e}")
        return {"error": str(e)}

# Image handling
def decode_base64_image(base64_string):
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    image_bytes = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_bytes))
    return image

def preprocess_image(image):
    image = image.resize((100, 100)).convert('RGB')  # Resize to match CNN input
    img_array = np.array(image).astype('float32') / 255.0  # Normalize
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array

def predict_image_class(preprocessed_image):
    predictions = MODEL.predict(preprocessed_image)[0]  # remove batch dimension

    # Get top 3 predictions with confidence
    top_indices = predictions.argsort()[-3:][::-1]  # Top 3 class indices, descending
    top_predictions = []

    for idx in top_indices:
        top_predictions.append({
            'class_name': class_labels[idx],
            'confidence': round(float(predictions[idx]), 4)
        })

    return {
        'predictions': top_predictions,
        'result': top_predictions[0]['class_name']  # Top 1 as main result
    }


def search_image(base64_image):
    try:
        image = decode_base64_image(base64_image)
        preprocessed_image = preprocess_image(image)
        results = predict_image_class(preprocessed_image)
        return results
    except Exception as e:
        return {'error': str(e)}
