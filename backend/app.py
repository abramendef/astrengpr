from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
from datetime import datetime, timezone
import base64
from dotenv import load_dotenv
from google_classroom import google_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

# Almacenamiento temporal de tokens (en producción usar base de datos)
tokens = {}

app.register_blueprint(google_bp)

@app.route('/')
def index():
    return jsonify({"message": "Astren Task API", "status": "running"})

if __name__ == '__main__':
    app.run(debug=True, port=8000) 