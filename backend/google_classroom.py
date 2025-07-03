import os
import json
import requests
from flask import Blueprint, redirect, request, session, jsonify
from urllib.parse import urlencode
from dotenv import load_dotenv

load_dotenv()

google_bp = Blueprint('google_classroom', __name__)

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI')
GOOGLE_AUTH_URI = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URI = 'https://oauth2.googleapis.com/token'
GOOGLE_CLASSROOM_API = 'https://classroom.googleapis.com/v1'

SCOPES = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
    'openid',
    'email',
    'profile'
]

# Almacenar tokens en memoria (solo para pruebas)
tokens = {}

@google_bp.route('/auth/google/url')
def google_auth_url():
    params = {
        'client_id': GOOGLE_CLIENT_ID,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'response_type': 'code',
        'scope': ' '.join(SCOPES),
        'access_type': 'offline',
        'prompt': 'consent',
    }
    url = f"{GOOGLE_AUTH_URI}?{urlencode(params)}"
    return jsonify({'auth_url': url})

@google_bp.route('/auth/google/callback')
def google_auth_callback():
    code = request.args.get('code')
    if not code:
        return 'No code provided', 400
    data = {
        'code': code,
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'grant_type': 'authorization_code',
    }
    resp = requests.post(GOOGLE_TOKEN_URI, data=data)
    if resp.status_code != 200:
        return f"Error getting token: {resp.text}", 400
    token_data = resp.json()
    # Guardar token en memoria (solo para pruebas)
    session['google_token'] = token_data
    tokens['default_user'] = token_data
    return redirect('/frontend/settings.html')

@google_bp.route('/sync/google/classroom', methods=['GET'])
def get_classroom_tasks():
    token = tokens.get('default_user', {}).get('access_token')
    if not token:
        return jsonify({'error': 'No autorizado con Google'}), 401
    headers = {'Authorization': f'Bearer {token}'}
    # Obtener cursos
    courses_resp = requests.get(f'{GOOGLE_CLASSROOM_API}/courses', headers=headers)
    if courses_resp.status_code != 200:
        return jsonify({'error': 'No se pudieron obtener los cursos', 'details': courses_resp.text}), 400
    courses = courses_resp.json().get('courses', [])
    all_tasks = []
    # Obtener tareas de cada curso
    for course in courses:
        course_id = course['id']
        coursework_resp = requests.get(f'{GOOGLE_CLASSROOM_API}/courses/{course_id}/courseWork', headers=headers)
        if coursework_resp.status_code == 200:
            coursework = coursework_resp.json().get('courseWork', [])
            for work in coursework:
                all_tasks.append({
                    'id': work['id'],
                    'title': work['title'],
                    'description': work.get('description', ''),
                    'due_date': work.get('dueDate', {}),
                    'status': work.get('state', 'UNKNOWN'),
                    'course': course['name'],
                    'source': 'google_classroom'
                })
    return jsonify({'tasks': all_tasks}) 