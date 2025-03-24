import json
import time
import os
import certifi
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

# Set up embedding model
Settings.embed_model = OpenAIEmbedding(model_name="text-embedding-ada-002")

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


