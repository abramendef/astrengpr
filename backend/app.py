from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
from datetime import datetime, timezone
import base64
from dotenv import load_dotenv
from google_classroom import google_bp
import mysql.connector
import re
import bcrypt

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Almacenamiento temporal de tokens (en producción usar base de datos)
tokens = {}

app.register_blueprint(google_bp)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="1234",
        database="astren"
    )

def actualizar_tareas_vencidas():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE tareas
        SET estado = 'vencida'
        WHERE estado = 'pendiente'
        AND fecha_vencimiento IS NOT NULL
        AND fecha_vencimiento < NOW()
    """)
    conn.commit()
    cursor.close()
    conn.close()

def crear_usuario(nombre, apellido, correo, contraseña, telefono=None):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Hashear la contraseña antes de guardar
        hashed = bcrypt.hashpw(contraseña.encode('utf-8'), bcrypt.gensalt())
        hashed_str = hashed.decode('utf-8')
        sql = "INSERT INTO usuarios (nombre, apellido, correo, contraseña, telefono) VALUES (%s, %s, %s, %s, %s)"
        print("Ejecutando SQL:", sql)
        print("Valores:", (nombre, apellido, correo, '***hash***', telefono))
        cursor.execute(sql, (nombre, apellido, correo, hashed_str, telefono))
        conn.commit()
        cursor.close()
        conn.close()
        print("Usuario insertado correctamente")
    except Exception as e:
        print("Error al insertar usuario:", e)

def obtener_usuarios():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios")
    usuarios = cursor.fetchall()
    
    # Imprimir información detallada de los usuarios
    print("🔍 [DEBUG] Usuarios en la base de datos:")
    for usuario in usuarios:
        print(f"   - ID: {usuario['id']}, Nombre: {usuario['nombre']}, Correo: {usuario['correo']}")
    
    cursor.close()
    conn.close()
    return usuarios

def crear_tarea(usuario_id, titulo, descripcion, area_id=None, grupo_id=None, fecha_vencimiento=None, estado='pendiente'):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Registro detallado de los parámetros de entrada
    print(f"🔍 [DEBUG] Parámetros para crear_tarea:")
    print(f"   - usuario_id: {usuario_id}")
    print(f"   - titulo: {titulo}")
    print(f"   - descripcion: {descripcion}")
    print(f"   - area_id: {area_id}")
    print(f"   - grupo_id: {grupo_id}")
    print(f"   - fecha_vencimiento: {fecha_vencimiento}")
    print(f"   - estado: {estado}")
    
    # Verificar tareas duplicadas con criterios más estrictos
    duplicate_check_sql = """
    SELECT id FROM tareas 
    WHERE usuario_id = %s 
    AND titulo = %s 
    AND (
        (descripcion IS NULL AND %s IS NULL) OR 
        (descripcion = %s)
    )
    AND (
        (area_id IS NULL AND %s IS NULL) OR 
        (area_id = %s)
    )
    AND (
        (fecha_vencimiento IS NULL AND %s IS NULL) OR 
        (fecha_vencimiento = %s)
    )
    AND estado = %s
    AND fecha_creacion > NOW() - INTERVAL 1 MINUTE
    """
    
    cursor.execute(duplicate_check_sql, (
        usuario_id, titulo, 
        descripcion, descripcion, 
        area_id, area_id, 
        fecha_vencimiento, fecha_vencimiento,
        estado
    ))
    
    existing_task = cursor.fetchone()
    if existing_task:
        print(f"⚠️ [WARN] Tarea duplicada detectada. ID de tarea existente: {existing_task['id']}")
        cursor.close()
        conn.close()
        return None
    
    # Insertar la nueva tarea
    sql = """
    INSERT INTO tareas (usuario_id, area_id, grupo_id, titulo, descripcion, fecha_vencimiento, estado)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    try:
        cursor.execute(sql, (usuario_id, area_id, grupo_id, titulo, descripcion, fecha_vencimiento, estado))
        conn.commit()
        task_id = cursor.lastrowid
        
        print(f"✅ [SUCCESS] Tarea creada con ID: {task_id}")
        
        cursor.close()
        conn.close()
        return task_id
    except Exception as e:
        print(f"❌ [ERROR] Error al crear tarea: {e}")
        conn.rollback()
        cursor.close()
        conn.close()
        return None

def obtener_tareas_usuario(usuario_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    sql = '''
        SELECT t.*, a.nombre AS area_nombre, a.color AS area_color, a.icono AS area_icono
        FROM tareas t
        LEFT JOIN areas a ON t.area_id = a.id
        WHERE t.usuario_id = %s AND t.estado != 'eliminada'
    '''
    cursor.execute(sql, (usuario_id,))
    tareas = cursor.fetchall()
    cursor.close()
    conn.close()
    return tareas

def crear_area(usuario_id, nombre, descripcion=None, color=None, icono=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "INSERT INTO areas (usuario_id, nombre, descripcion, color, icono, estado) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(sql, (usuario_id, nombre, descripcion, color, icono, 'activa'))
    conn.commit()
    area_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return area_id

def obtener_areas_usuario(usuario_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    sql = "SELECT * FROM areas WHERE usuario_id = %s"
    cursor.execute(sql, (usuario_id,))
    areas = cursor.fetchall()
    
    # Imprimir información detallada de las áreas
    print(f"🔍 [DEBUG] Áreas para usuario {usuario_id}:")
    for area in areas:
        print(f"   - ID: {area['id']}, Nombre: {area['nombre']}, Estado: {area['estado']}, Color: {area['color']}, Icono: {area['icono']}")
    
    cursor.close()
    conn.close()
    return areas

def obtener_tareas_area(usuario_id, area_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Verificar primero que el área exista y esté activa
    area_check_query = "SELECT * FROM areas WHERE id = %s AND usuario_id = %s AND estado = 'activa'"
    cursor.execute(area_check_query, (area_id, usuario_id))
    area = cursor.fetchone()
    
    if not area:
        print(f"[DEBUG] Área {area_id} no encontrada o no activa para usuario {usuario_id}")
        cursor.close()
        conn.close()
        return []
    
    # Consulta para obtener tareas del área
    sql = """
    SELECT t.*, a.nombre AS area_nombre, a.color AS area_color, a.icono AS area_icono
    FROM tareas t
    LEFT JOIN areas a ON t.area_id = a.id
    WHERE t.usuario_id = %s AND t.area_id = %s AND t.estado != 'eliminada'
    """
    
    try:
        cursor.execute(sql, (usuario_id, area_id))
        tareas = cursor.fetchall()
        
        print(f"[DEBUG] Tareas encontradas para área {area_id}: {tareas}")
        
        return tareas
    except Exception as e:
        print(f"[ERROR] Error al obtener tareas para área: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

# Eliminar la función de inserción de tareas de prueba y la ruta de depuración
# Las tareas se crearán manualmente según sea necesario

@app.route('/areas', methods=['POST'])
def registrar_area():
    data = request.json
    print('Datos recibidos en /areas:', data)  # DEPURACIÓN
    if not data:
        return jsonify({"error": "Datos no enviados"}), 400
    if not data.get('usuario_id'):
        return jsonify({"error": "usuario_id es obligatorio"}), 400
    if not data.get('nombre') or len(data['nombre'].strip()) < 2:
        return jsonify({"error": "El nombre del área debe tener al menos 2 caracteres"}), 400
    # Validar que el usuario exista
    usuarios = obtener_usuarios()
    if not any(str(u['id']) == str(data['usuario_id']) for u in usuarios):
        return jsonify({"error": "El usuario no existe"}), 400
    descripcion = data.get('descripcion')
    color = data.get('color')
    icono = data.get('icono')
    area_id = crear_area(data['usuario_id'], data['nombre'].strip(), descripcion, color, icono)
    return jsonify({"mensaje": "Área creada", "area_id": area_id}), 201

@app.route('/')
def index():
    return jsonify({"message": "Astren Task API", "status": "running"})

@app.route('/usuarios', methods=['POST'])
def registrar_usuario():
    data = request.json
    # Validaciones
    if not data:
        return jsonify({"error": "Datos no enviados"}), 400
    if not data.get('nombre') or not data.get('apellido'):
        return jsonify({"error": "Nombre y apellido son obligatorios"}), 400
    if not data.get('correo'):
        return jsonify({"error": "Correo es obligatorio"}), 400
    # Validar formato de correo
    email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not re.match(email_regex, data['correo']):
        return jsonify({"error": "Correo inválido"}), 400
    if not data.get('contraseña') or len(data['contraseña']) < 8:
        return jsonify({"error": "La contraseña debe tener al menos 8 caracteres"}), 400
    # Validar que el correo no exista
    usuarios = obtener_usuarios()
    if any(u['correo'] == data['correo'] for u in usuarios):
        return jsonify({"error": "Ya existe un usuario con ese correo"}), 400
    crear_usuario(data['nombre'], data['apellido'], data['correo'], data['contraseña'], data.get('telefono'))
    return jsonify({"mensaje": "Usuario creado"}), 201

@app.route('/usuarios', methods=['GET'])
def listar_usuarios():
    usuarios = obtener_usuarios()
    return jsonify(usuarios)

@app.route('/login', methods=['POST'])
def login_usuario():
    data = request.json
    if not data or not data.get('correo') or not data.get('contraseña'):
        return jsonify({'error': 'Correo y contraseña son obligatorios'}), 400
    correo = data['correo']
    contraseña = data['contraseña']
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios WHERE correo = %s", (correo,))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()
    if not usuario:
        return jsonify({'error': 'Usuario o contraseña incorrectos'}), 401
    # Si usuario es una tupla, convertirlo a dict usando la descripción del cursor
    if not isinstance(usuario, dict):
        columns = [col[0] for col in cursor.description]
        usuario = dict(zip(columns, usuario))
    hashed_db = str(usuario['contraseña'])  # Asegura que es string
    hashed = hashed_db.encode('utf-8')
    if bcrypt.checkpw(contraseña.encode('utf-8'), hashed):
        # Puedes devolver más datos del usuario si quieres, pero nunca la contraseña
        return jsonify({'mensaje': 'Login exitoso', 'usuario_id': usuario['id'], 'nombre': usuario['nombre'], 'apellido': usuario['apellido'], 'correo': usuario['correo']}), 200
    else:
        return jsonify({'error': 'Usuario o contraseña incorrectos'}), 401

@app.route('/tareas', methods=['POST'])
def registrar_tarea():
    data = request.json
    print("🔍 [DEBUG] Datos recibidos para tarea:", data)  # Depuración detallada
    
    # Validaciones
    if not data:
        print("❌ [ERROR] No se recibieron datos")
        return jsonify({"error": "Datos no enviados"}), 400
    
    if not data.get('usuario_id'):
        print("❌ [ERROR] usuario_id es obligatorio")
        return jsonify({"error": "usuario_id es obligatorio", "campos_recibidos": list(data.keys())}), 400
    
    if not data.get('titulo'):
        print("❌ [ERROR] El título es obligatorio")
        return jsonify({"error": "El título es obligatorio", "campos_recibidos": list(data.keys())}), 400
    
    # Convertir usuario_id a entero si es un string
    try:
        usuario_id = int(data.get('usuario_id'))
    except (ValueError, TypeError):
        print(f"❌ [ERROR] usuario_id inválido: {data.get('usuario_id')}")
        return jsonify({"error": "usuario_id debe ser un número válido", "valor_recibido": data.get('usuario_id')}), 400
    
    # Validar que el usuario exista (comparar como string para evitar problemas de tipo)
    usuarios = obtener_usuarios()
    if not any(str(u['id']) == str(usuario_id) for u in usuarios):
        print(f"❌ [ERROR] El usuario {usuario_id} no existe")
        return jsonify({
            "error": "El usuario no existe", 
            "usuarios_disponibles": [u['id'] for u in usuarios],
            "usuario_intentado": usuario_id
        }), 400
    
    # Validar que el área exista y no esté eliminada
    area_id = data.get('area_id')
    if area_id:
        try:
            area_id = int(area_id)
        except (ValueError, TypeError):
            print(f"❌ [ERROR] area_id inválido: {data.get('area_id')}")
            return jsonify({"error": "area_id debe ser un número válido", "valor_recibido": data.get('area_id')}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verificar si el área pertenece al usuario y no está eliminada
        cursor.execute("""
            SELECT * FROM areas 
            WHERE id = %s 
            AND usuario_id = %s 
            AND estado != 'eliminada'
        """, (area_id, usuario_id))
        area = cursor.fetchone()
        
        # Imprimir todas las áreas del usuario para depuración
        cursor.execute("SELECT id, nombre, estado FROM areas WHERE usuario_id = %s", (usuario_id,))
        todas_areas = cursor.fetchall()
        print("🔍 [DEBUG] Áreas del usuario:", todas_areas)
        
        cursor.close()
        conn.close()
        
        if not area:
            print(f"❌ [ERROR] El área {area_id} no existe o está eliminada para el usuario {usuario_id}")
            return jsonify({
                "error": "El área seleccionada no existe o está eliminada", 
                "area_intentada": area_id,
                "areas_usuario": todas_areas
            }), 400
    
    # Usar 'pendiente' por defecto si no se especifica estado
    estado = data.get('estado', 'pendiente')
    
    print(f"✅ [DEBUG] Creando tarea con datos: usuario={usuario_id}, titulo={data['titulo']}, area={area_id}, estado={estado}")
    
    task_id = crear_tarea(
        usuario_id,
        data['titulo'],
        data.get('descripcion'),
        area_id,
        data.get('grupo_id'),
        data.get('fecha_vencimiento'),
        estado
    )
    
    if task_id is None:
        print("⚠️ [WARN] Tarea no creada (posiblemente duplicada)")
        return jsonify({"mensaje": "Tarea no creada"}), 200
    
    print("✅ [SUCCESS] Tarea creada exitosamente")
    return jsonify({
        "mensaje": "Tarea creada", 
        "tarea": {
            "id": task_id,
            "titulo": data['titulo'], 
            "area_id": area_id
        }
    }), 201

@app.route('/tareas/<int:usuario_id>', methods=['GET'])
def listar_tareas(usuario_id):
    actualizar_tareas_vencidas()  # Actualiza tareas vencidas antes de listar
    tareas = obtener_tareas_usuario(usuario_id)
    tareas = [dict(t) for t in tareas]  # Asegura que cada tarea es un dict
    for tarea in tareas:
        fecha = tarea.get('fecha_vencimiento')
        if fecha:
            if isinstance(fecha, datetime):
                tarea['fecha_vencimiento'] = fecha.strftime('%Y-%m-%d %H:%M')
            elif isinstance(fecha, str) and 'T' in fecha:
                try:
                    dt = datetime.fromisoformat(fecha.replace('Z', ''))
                    tarea['fecha_vencimiento'] = dt.strftime('%Y-%m-%d %H:%M')
                except Exception:
                    pass
    return jsonify(tareas)

@app.route('/tareas/<int:tarea_id>/estado', methods=['PUT'])
def actualizar_estado_tarea(tarea_id):
    data = request.json
    nuevo_estado = data.get('estado')
    if nuevo_estado not in ['pendiente', 'completada', 'vencida']:
        return jsonify({'error': 'Estado inválido'}), 400
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "UPDATE tareas SET estado = %s WHERE id = %s"
    cursor.execute(sql, (nuevo_estado, tarea_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'mensaje': 'Estado actualizado', 'id': tarea_id, 'estado': nuevo_estado})

@app.route('/tareas/<int:tarea_id>', methods=['DELETE'])
def eliminar_tarea(tarea_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Verificar si la tarea existe y no está ya eliminada
        cursor.execute("SELECT * FROM tareas WHERE id = %s AND estado != 'eliminada'", (tarea_id,))
        tarea = cursor.fetchone()
        
        if not tarea:
            print(f"⚠️ [WARN] Intento de eliminar tarea inexistente o ya eliminada: {tarea_id}")
            cursor.close()
            conn.close()
            return jsonify({'mensaje': 'Tarea no encontrada o ya eliminada'}), 404
        
        # Realizar soft delete
        sql = "UPDATE tareas SET estado = 'eliminada' WHERE id = %s"
        cursor.execute(sql, (tarea_id,))
        conn.commit()
        
        print(f"✅ [SUCCESS] Tarea {tarea_id} eliminada exitosamente")
        cursor.close()
        conn.close()
        return jsonify({'mensaje': 'Tarea eliminada', 'id': tarea_id}), 200
    
    except Exception as e:
        print(f"❌ [ERROR] Error al eliminar tarea {tarea_id}: {e}")
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': 'Error al eliminar la tarea'}), 500

@app.route('/tareas/area/<int:usuario_id>/<int:area_id>', methods=['GET'])
def listar_tareas_area(usuario_id, area_id):
    tareas = obtener_tareas_area(usuario_id, area_id)
    return jsonify(tareas)

@app.route('/areas/<int:usuario_id>', methods=['GET'])
def listar_areas(usuario_id):
    areas = obtener_areas_usuario(usuario_id)
    print('[DEBUG] /areas/<usuario_id> devuelve:', areas)
    return jsonify(areas)

@app.route('/areas/<int:area_id>', methods=['DELETE'])
def eliminar_area(area_id):
    print(f"[DEBUG] Eliminando área con id: {area_id}")  # DEPURACIÓN
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "UPDATE areas SET estado = 'eliminada' WHERE id = %s"
    cursor.execute(sql, (area_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'mensaje': 'Área eliminada (soft delete)', 'id': area_id})

@app.route('/debug/tareas', methods=['GET'])
def debug_tareas():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM tareas")
    tareas = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(tareas)

if __name__ == '__main__':
    app.run(debug=True, port=8000) 