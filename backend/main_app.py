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

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración de APIs
MICROSOFT_CLIENT_ID = os.getenv('MICROSOFT_CLIENT_ID')
MICROSOFT_CLIENT_SECRET = os.getenv('MICROSOFT_CLIENT_SECRET')
MICROSOFT_REDIRECT_URI = os.getenv('MICROSOFT_REDIRECT_URI', 'http://localhost:5000/auth/microsoft/callback')

# Almacenamiento temporal de tokens (en producción usar base de datos)
tokens = {}

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

if __name__ == '__main__':
    app.run(debug=True, port=5000) 