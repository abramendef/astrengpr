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

# Configuración de APIs
MICROSOFT_CLIENT_ID = os.getenv('MICROSOFT_CLIENT_ID')
MICROSOFT_CLIENT_SECRET = os.getenv('MICROSOFT_CLIENT_SECRET')
MICROSOFT_REDIRECT_URI = os.getenv('MICROSOFT_REDIRECT_URI', 'http://localhost:5000/auth/microsoft/callback')

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
    return jsonify({"message": "Astren Task Sync API", "status": "running"})

# Endpoints para Microsoft To Do
@app.route('/auth/microsoft/url')
def get_microsoft_auth_url():
    """Genera URL de autorización para Microsoft Graph API"""
    auth_url = f"https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    params = {
        'client_id': MICROSOFT_CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': MICROSOFT_REDIRECT_URI,
        'scope': 'Tasks.ReadWrite offline_access',
        'response_mode': 'query'
    }
    
    query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
    return jsonify({"auth_url": f"{auth_url}?{query_string}"})

@app.route('/auth/microsoft/callback')
def microsoft_auth_callback():
    """Callback para autorización de Microsoft"""
    code = request.args.get('code')
    if not code:
        return jsonify({"error": "No authorization code received"}), 400
    
    # Intercambiar código por token
    token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    token_data = {
        'client_id': MICROSOFT_CLIENT_ID,
        'client_secret': MICROSOFT_CLIENT_SECRET,
        'code': code,
        'redirect_uri': MICROSOFT_REDIRECT_URI,
        'grant_type': 'authorization_code'
    }
    
    try:
        response = requests.post(token_url, data=token_data)
        response.raise_for_status()
        token_info = response.json()
        
        # Guardar token (en producción usar base de datos)
        user_id = "default_user"  # En producción obtener del usuario autenticado
        tokens[user_id] = {
            'microsoft': token_info,
            'expires_at': datetime.now().timestamp() + token_info.get('expires_in', 3600)
        }
        
        return jsonify({"message": "Microsoft To Do conectado exitosamente"})
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error obteniendo token: {str(e)}"}), 500

@app.route('/sync/microsoft/tasks', methods=['GET'])
def get_microsoft_tasks():
    """Obtener tareas de Microsoft To Do"""
    user_id = "default_user"
    if user_id not in tokens or 'microsoft' not in tokens[user_id]:
        return jsonify({"error": "No autorizado con Microsoft"}), 401
    
    access_token = tokens[user_id]['microsoft']['access_token']
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Obtener listas de tareas
        lists_url = "https://graph.microsoft.com/v1.0/me/todo/lists"
        lists_response = requests.get(lists_url, headers=headers)
        lists_response.raise_for_status()
        lists = lists_response.json().get('value', [])
        
        all_tasks = []
        for task_list in lists:
            tasks_url = f"https://graph.microsoft.com/v1.0/me/todo/lists/{task_list['id']}/tasks"
            tasks_response = requests.get(tasks_url, headers=headers)
            if tasks_response.status_code == 200:
                tasks = tasks_response.json().get('value', [])
                for task in tasks:
                    all_tasks.append({
                        'id': task['id'],
                        'title': task['title'],
                        'description': task.get('body', {}).get('content', ''),
                        'due_date': task.get('dueDateTime', {}).get('dateTime'),
                        'status': 'completed' if task.get('status') == 'completed' else 'pending',
                        'list_name': task_list['displayName'],
                        'source': 'microsoft'
                    })
        
        return jsonify({"tasks": all_tasks})
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error obteniendo tareas: {str(e)}"}), 500

@app.route('/sync/microsoft/tasks', methods=['POST'])
def create_microsoft_task():
    """Crear tarea en Microsoft To Do"""
    user_id = "default_user"
    if user_id not in tokens or 'microsoft' not in tokens[user_id]:
        return jsonify({"error": "No autorizado con Microsoft"}), 401
    
    data = request.json
    access_token = tokens[user_id]['microsoft']['access_token']
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    # Obtener lista por defecto o crear una nueva
    try:
        lists_url = "https://graph.microsoft.com/v1.0/me/todo/lists"
        lists_response = requests.get(lists_url, headers=headers)
        lists_response.raise_for_status()
        lists = lists_response.json().get('value', [])
        
        if not lists:
            # Crear lista por defecto
            create_list_data = {
                "displayName": "Astren Tasks"
            }
            create_response = requests.post(lists_url, headers=headers, json=create_list_data)
            create_response.raise_for_status()
            list_id = create_response.json()['id']
        else:
            list_id = lists[0]['id']  # Usar la primera lista
        
        # Crear tarea
        task_data = {
            "title": data['title'],
            "body": {
                "content": data.get('description', ''),
                "contentType": "text"
            }
        }
        
        if data.get('due_date'):
            task_data["dueDateTime"] = {
                "dateTime": data['due_date'],
                "timeZone": "UTC"
            }
        
        task_url = f"https://graph.microsoft.com/v1.0/me/todo/lists/{list_id}/tasks"
        task_response = requests.post(task_url, headers=headers, json=task_data)
        task_response.raise_for_status()
        
        return jsonify({"message": "Tarea creada en Microsoft To Do", "task": task_response.json()})
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error creando tarea: {str(e)}"}), 500

# Endpoints para iCloud Reminders (usando CalDAV)
@app.route('/sync/icloud/connect', methods=['POST'])
def connect_icloud():
    """Conectar con iCloud Reminders usando CalDAV"""
    data = request.json
    apple_id = data.get('apple_id')
    app_specific_password = data.get('app_specific_password')
    
    if not apple_id or not app_specific_password:
        return jsonify({"error": "Se requiere Apple ID y contraseña específica de app"}), 400
    
    # Guardar credenciales (en producción usar encriptación)
    user_id = "default_user"
    tokens[user_id] = {
        'icloud': {
            'apple_id': apple_id,
            'password': app_specific_password
        }
    }
    
    return jsonify({"message": "Credenciales de iCloud guardadas"})

@app.route('/sync/icloud/tasks', methods=['GET'])
def get_icloud_tasks():
    """Obtener tareas de iCloud Reminders usando CalDAV"""
    user_id = "default_user"
    if user_id not in tokens or 'icloud' not in tokens[user_id]:
        return jsonify({"error": "No conectado con iCloud"}), 401
    
    icloud_creds = tokens[user_id]['icloud']
    
    # URL de CalDAV para iCloud
    caldav_url = f"https://caldav.icloud.com/{icloud_creds['apple_id']}/reminders"
    
    headers = {
        'Authorization': f'Basic {base64.b64encode(f"{icloud_creds['apple_id']}:{icloud_creds['password']}".encode()).decode()}',
        'Content-Type': 'application/xml; charset=utf-8'
    }
    
    # Propfind request para obtener tareas
    propfind_body = """<?xml version="1.0" encoding="utf-8"?>
    <propfind xmlns="DAV:">
        <prop>
            <getetag/>
            <calendar-data/>
        </prop>
    </propfind>"""
    
    try:
        response = requests.request('PROPFIND', caldav_url, headers=headers, data=propfind_body)
        response.raise_for_status()
        
        # Parsear respuesta XML (simplificado)
        # En una implementación completa, necesitarías parsear el XML de respuesta
        tasks = []  # Aquí se parsearían las tareas del XML
        
        return jsonify({"tasks": tasks, "message": "Tareas obtenidas de iCloud"})
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error conectando con iCloud: {str(e)}"}), 500

# Endpoint para sincronización bidireccional
@app.route('/sync/sync-all', methods=['POST'])
def sync_all_tasks():
    """Sincronizar tareas entre Astren y servicios externos"""
    data = request.json
    local_tasks = data.get('local_tasks', [])
    sync_services = data.get('sync_services', [])
    
    synced_tasks = []
    
    for service in sync_services:
        if service == 'microsoft':
            # Sincronizar con Microsoft To Do
            try:
                # Obtener tareas de Microsoft
                ms_tasks_response = get_microsoft_tasks()
                if ms_tasks_response.status_code == 200:
                    ms_tasks = ms_tasks_response.json['tasks']
                    synced_tasks.extend(ms_tasks)
            except Exception as e:
                print(f"Error sincronizando con Microsoft: {e}")
        
        elif service == 'icloud':
            # Sincronizar con iCloud
            try:
                icloud_tasks_response = get_icloud_tasks()
                if icloud_tasks_response.status_code == 200:
                    icloud_tasks = icloud_tasks_response.json['tasks']
                    synced_tasks.extend(icloud_tasks)
            except Exception as e:
                print(f"Error sincronizando con iCloud: {e}")
    
    return jsonify({
        "synced_tasks": synced_tasks,
        "message": f"Sincronización completada con {len(sync_services)} servicios"
    })

# Endpoint para configuración de sincronización
@app.route('/sync/config', methods=['GET', 'PUT'])
def sync_config():
    """Obtener o actualizar configuración de sincronización"""
    user_id = "default_user"
    
    if request.method == 'GET':
        config = {
            'microsoft_connected': user_id in tokens and 'microsoft' in tokens[user_id],
            'icloud_connected': user_id in tokens and 'icloud' in tokens[user_id],
            'auto_sync': True,  # En producción obtener de base de datos
            'sync_interval': 30  # minutos
        }
        return jsonify(config)
    
    elif request.method == 'PUT':
        data = request.json
        # Guardar configuración (en producción usar base de datos)
        return jsonify({"message": "Configuración actualizada"})

@app.route('/ia', methods=['POST'])
def ia_endpoint():
    data = request.get_json()
    user_input = data.get('mensaje', '')
    if not user_input:
        return jsonify({'respuesta': 'No se recibió ningún mensaje.'}), 400
    
    # Usar IA avanzada si está disponible
    if AI_AVAILABLE:
        try:
            respuesta = ai_core.process_message(user_input)
        except Exception as e:
            print(f"Error en IA avanzada: {e}")
            # Fallback a procesador básico
            processor = IntentProcessor()
            respuesta = processor.process(user_input)
    else:
        # Usar procesador básico
        processor = IntentProcessor()
        respuesta = processor.process(user_input)
    
    return jsonify({'respuesta': respuesta})

@app.route('/ia/status', methods=['GET'])
def ia_status():
    """Endpoint para obtener el estado de la IA"""
    if AI_AVAILABLE:
        try:
            status = ai_core.get_ai_status()
            return jsonify({'status': status, 'available': True})
        except Exception as e:
            return jsonify({'status': f'Error: {str(e)}', 'available': False})
    else:
        return jsonify({'status': 'IA básica disponible', 'available': False})

@app.route('/ia/topics', methods=['GET'])
def ia_topics():
    """Endpoint para obtener temas disponibles"""
    if AI_AVAILABLE:
        try:
            topics = ai_core.get_available_topics()
            return jsonify({'topics': topics, 'available': True})
        except Exception as e:
            return jsonify({'topics': f'Error: {str(e)}', 'available': False})
    else:
        return jsonify({'topics': 'Temas básicos disponibles', 'available': False})

@app.route('/ia/session', methods=['GET'])
def ia_session():
    """Endpoint para obtener resumen de sesión"""
    if AI_AVAILABLE:
        try:
            summary = ai_core.get_session_summary()
            return jsonify({'summary': summary, 'available': True})
        except Exception as e:
            return jsonify({'summary': f'Error: {str(e)}', 'available': False})
    else:
        return jsonify({'summary': 'Sesión básica', 'available': False})

def main():
    print('IA local lista. Escribe "salir" para terminar.')
    processor = IntentProcessor()
    while True:
        user_input = input('Tú: ')
        if user_input.lower() == 'salir':
            print('¡Hasta luego!')
            break
        response = processor.process(user_input)
        print('IA:', response)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'terminal':
        main()
    else:
        app.run(debug=True, port=8000) 