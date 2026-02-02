# AstrenGPR - Backend principal
# Ejecuta desde la carpeta del proyecto: python -m backend.app

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
from datetime import datetime, timezone
import base64
from dotenv import load_dotenv
import sys

load_dotenv()

app = Flask(__name__)
CORS(app)

# Almacenamiento temporal de tokens (en producción usar base de datos)
tokens = {}

# Importar el nuevo sistema de IA
try:
    from ia.ai_core import AICore
    ai_core = AICore()
    AI_AVAILABLE = True
except ImportError as e:
    print(f"IA avanzada no disponible: {e}")
    AI_AVAILABLE = False

# Módulos IA básicos (fallback)
class ConversationalModule:
    def handle(self, user_input):
        if 'hola' in user_input.lower():
            return 'Hola! En qué puedo ayudarte?'
        elif 'hora' in user_input.lower():
            return f'Son las {datetime.now().strftime("%H:%M:%S")}'
        else:
            return 'No entendí, pero sigo aprendiendo.'

class TaskManagerModule:
    def __init__(self):
        self.tasks = []
    def handle(self, user_input):
        if 'agrega tarea' in user_input.lower():
            tarea = user_input.lower().replace('agrega tarea', '').strip()
            if tarea:
                self.tasks.append(tarea)
                return f'Tarea "{tarea}" agregada.'
            else:
                return 'Qué tarea quieres agregar?'
        elif 'lista tareas' in user_input.lower():
            if not self.tasks:
                return 'No tienes tareas pendientes.'
            return 'Tus tareas:\n' + '\n'.join(f'- {t}' for t in self.tasks)
        else:
            return None

class AutomationModule:
    def handle(self, user_input):
        if 'abre bloc de notas' in user_input.lower():
            os.system('notepad.exe')
            return 'Abriendo Bloc de Notas.'
        return None

class TextProcessingModule:
    def handle(self, user_input):
        if user_input.lower().startswith('resume el texto:'):
            texto = user_input[len('resume el texto:'):].strip()
            if not texto:
                return 'Por favor, proporciona el texto a resumir.'
            palabras = texto.split()
            resumen = ' '.join(palabras[:20])
            if len(palabras) > 20:
                resumen += '...'
            return f'Resumen: {resumen}'
        return None

class FileAutomationModule:
    def handle(self, user_input):
        if user_input.lower().startswith('crea carpeta'):
            partes = user_input.split(' ', 2)
            if len(partes) < 3:
                return 'Debes indicar el nombre de la carpeta.'
            nombre = partes[2].strip()
            try:
                os.makedirs(nombre, exist_ok=True)
                return f'Carpeta "{nombre}" creada.'
            except Exception as e:
                return f'Error al crear la carpeta: {e}'
        return None

# Procesador de intenciones
class IntentProcessor:
    def __init__(self):
        self.modules = [
            TaskManagerModule(),
            AutomationModule(),
            FileAutomationModule(),
            TextProcessingModule(),
            ConversationalModule()
        ]
    def process(self, user_input):
        if AI_AVAILABLE:
            try:
                return ai_core.process_message(user_input)
            except Exception as e:
                print(f"Error en IA avanzada: {e}")
        
        for module in self.modules:
            response = module.handle(user_input)
            if response:
                return response
        return 'No sé cómo ayudarte con eso todavía.'

@app.route('/')
def index():
    return jsonify({"message": "AstrenGPR API", "status": "running"})

@app.route('/ia', methods=['POST'])
def ia_endpoint():
    """Endpoint principal para interacción con IA"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Se requiere un mensaje"}), 400
    user_input = data.get('message', '')

    if not user_input:
        return jsonify({"error": "Se requiere un mensaje"}), 400

    processor = IntentProcessor()
    response = processor.process(user_input)

    return jsonify({
        "response": response,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/ia/status', methods=['GET'])
def ia_status():
    """Obtener estado del sistema de IA"""
    return jsonify({
        "ai_available": AI_AVAILABLE,
        "status": "running"
    })

def main():
    port = int(os.getenv('PORT', 5000))
    print(f"Iniciando AstrenGPR API en puerto {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)

if __name__ == '__main__':
    main()
