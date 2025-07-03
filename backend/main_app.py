# El backend de Astren ahora se encuentra en backend/app.py
# Ejecuta el backend desde la carpeta backend para iniciar la API Flask.

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
from datetime import datetime, timezone
import base64
from dotenv import load_dotenv
import sys
import shutil
import subprocess
from PIL import ImageGrab

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
    print(f"⚠️ IA avanzada no disponible: {e}")
    AI_AVAILABLE = False

# Módulos IA básicos (fallback)
class ConversationalModule:
    def handle(self, user_input):
        # Respuestas simples
        if 'hola' in user_input.lower():
            return '¡Hola! ¿En qué puedo ayudarte?'
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
                return '¿Qué tarea quieres agregar?'
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
            # Resumen simple: primeras 20 palabras
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
                return 'Debes indicar el nombre de la carpeta. Ejemplo: crea carpeta Proyectos'
            nombre = partes[2].strip()
            try:
                os.makedirs(nombre, exist_ok=True)
                return f'Carpeta "{nombre}" creada.'
            except Exception as e:
                return f'Error al crear la carpeta: {e}'
        return None

class ComputerControlModule:
    def handle(self, user_input):
        if not user_input.lower().startswith('permite:'):
            return None
        orden = user_input[len('permite:'):].strip().lower()
        if orden == 'apaga la computadora':
            os.system('shutdown /s /t 1')
            return 'Apagando la computadora...'
        elif orden == 'reinicia la computadora':
            os.system('shutdown /r /t 1')
            return 'Reiniciando la computadora...'
        elif orden == 'suspende la computadora':
            os.system('rundll32.exe powrprof.dll,SetSuspendState 0,1,0')
            return 'Suspendiendo la computadora...'
        elif orden == 'abre calculadora':
            os.system('calc.exe')
            return 'Abriendo la calculadora.'
        elif orden == 'abre navegador':
            # Abre el navegador predeterminado
            if sys.platform == 'win32':
                os.system('start microsoft-edge:')
            else:
                os.system('xdg-open https://www.google.com')
            return 'Abriendo el navegador.'
        elif orden == 'bloquea la sesión':
            os.system('rundll32.exe user32.dll,LockWorkStation')
            return 'Bloqueando la sesión.'
        elif orden == 'toma captura de pantalla':
            try:
                img = ImageGrab.grab()
                nombre = f'captura_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'
                img.save(nombre)
                return f'Captura de pantalla guardada como {nombre}.'
            except Exception as e:
                return f'No se pudo tomar la captura: {e}'
        else:
            return 'Acción no reconocida o no permitida.'

# Procesador de intenciones
class IntentProcessor:
    def __init__(self):
        self.modules = [
            TaskManagerModule(),
            AutomationModule(),
            FileAutomationModule(),
            TextProcessingModule(),
            ComputerControlModule(),
            ConversationalModule()
        ]
    def process(self, user_input):
        # Usar IA avanzada si está disponible
        if AI_AVAILABLE:
            try:
                return ai_core.process_message(user_input)
            except Exception as e:
                print(f"Error en IA avanzada: {e}")
                # Fallback a módulos básicos
        
        # Módulos básicos como fallback
        for module in self.modules:
            response = module.handle(user_input)
            if response:
                return response
        return 'No sé cómo ayudarte con eso todavía.'

@app.route('/')
def index():
    return jsonify({"message": "Astren Task API", "status": "running"})

# Endpoints de IA
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
        "status": "running",
        "modules": [
            "ConversationalModule",
            "TaskManagerModule", 
            "AutomationModule",
            "TextProcessingModule",
            "FileAutomationModule",
            "ComputerControlModule"
        ]
    })

@app.route('/ia/topics', methods=['GET'])
def ia_topics():
    """Obtener temas que puede manejar la IA"""
    return jsonify({
        "topics": [
            "Gestión de tareas",
            "Automatización del sistema",
            "Procesamiento de texto",
            "Gestión de archivos",
            "Control del computador",
            "Conversación general"
        ]
    })

@app.route('/ia/session', methods=['GET'])
def ia_session():
    """Obtener información de la sesión de IA"""
    return jsonify({
        "session_id": "default",
        "start_time": datetime.now().isoformat(),
        "ai_version": "1.0"
    })

def main():
    print("🚀 Iniciando Astren Task API...")
    print("📡 Servidor disponible en: http://localhost:5000")
    print("🤖 IA disponible:", "Sí" if AI_AVAILABLE else "No")
    app.run(debug=True, port=5000)

if __name__ == '__main__':
    main() 