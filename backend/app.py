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
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', '1234'),
            database=os.getenv('DB_NAME', 'astren')
        )
        return conn
    except mysql.connector.Error as err:
        print(f"❌ Error de conexión a la base de datos: {err}")
        if err.errno == mysql.connector.errorcode.CR_CONN_HOST_ERROR:
            print("No se puede conectar al host de la base de datos.")
        elif err.errno == mysql.connector.errorcode.ER_ACCESS_DENIED_ERROR:
            print("Credenciales de acceso incorrectas.")
        elif err.errno == mysql.connector.errorcode.ER_BAD_DB_ERROR:
            print("La base de datos no existe.")
        raise

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

def crear_tarea(usuario_id, titulo, descripcion, area_id=None, grupo_id=None, asignado_a_id=None, fecha_vencimiento=None, estado='pendiente'):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Registro detallado de los parámetros de entrada
    print(f"🔍 [DEBUG] Parámetros para crear_tarea:")
    print(f"   - usuario_id: {usuario_id}")
    print(f"   - titulo: {titulo}")
    print(f"   - descripcion: {descripcion}")
    print(f"   - area_id: {area_id}")
    print(f"   - grupo_id: {grupo_id}")
    print(f"   - asignado_a_id: {asignado_a_id}")
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
        INSERT INTO tareas (usuario_id, area_id, grupo_id, asignado_a_id, titulo, descripcion, fecha_vencimiento, estado)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        cursor.execute(sql, (usuario_id, area_id, grupo_id, asignado_a_id, titulo, descripcion, fecha_vencimiento, estado))
        conn.commit()
        task_id = cursor.lastrowid
        
        print(f"✅ [SUCCESS] Tarea creada con ID: {task_id}")
        
        # Si la tarea está asignada a alguien, crear notificación
        if asignado_a_id and asignado_a_id != usuario_id:
            notificar_tarea_asignada(task_id, grupo_id, asignado_a_id, titulo)
        
        cursor.close()
        conn.close()
        return task_id
    except Exception as e:
        print(f"❌ [ERROR] Error al crear tarea: {e}")
        conn.rollback()
        cursor.close()
        conn.close()
        return None

def crear_tarea_grupo_multiple(usuario_id, titulo, descripcion, grupo_id, asignados_ids, area_id=None, fecha_vencimiento=None, estado='pendiente'):
    """Crear múltiples tareas para un grupo (una por cada miembro asignado)"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    print(f"🔍 [DEBUG] Creando tareas múltiples para grupo:")
    print(f"   - usuario_id: {usuario_id}")
    print(f"   - titulo: {titulo}")
    print(f"   - grupo_id: {grupo_id}")
    print(f"   - asignados_ids: {asignados_ids}")
    
    tareas_creadas = []
    
    try:
        for asignado_id in asignados_ids:
            # Verificar que el usuario asignado sea miembro del grupo
            if not verificar_miembro_grupo(grupo_id, asignado_id):
                print(f"⚠️ [WARN] Usuario {asignado_id} no es miembro del grupo {grupo_id}")
                continue
            
            # Insertar la tarea para este usuario
            sql = """
                INSERT INTO tareas (usuario_id, area_id, grupo_id, asignado_a_id, titulo, descripcion, fecha_vencimiento, estado)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (asignado_id, area_id, grupo_id, asignado_id, titulo, descripcion, fecha_vencimiento, estado))
            task_id = cursor.lastrowid
            
            # Crear notificación si no es el mismo usuario
            if asignado_id != usuario_id:
                notificar_tarea_asignada(task_id, grupo_id, asignado_id, titulo)
            
            tareas_creadas.append(task_id)
            print(f"✅ [SUCCESS] Tarea creada con ID: {task_id} para usuario {asignado_id}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Total de tareas creadas: {len(tareas_creadas)}")
        return tareas_creadas
        
    except Exception as e:
        print(f"❌ [ERROR] Error al crear tareas múltiples: {e}")
        conn.rollback()
        cursor.close()
        conn.close()
        return []

def obtener_tareas_usuario(usuario_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    sql = '''
        SELECT t.*, a.nombre AS area_nombre, a.color AS area_color, a.icono AS area_icono,
               g.nombre AS grupo_nombre, u.nombre AS asignado_nombre, u.apellido AS asignado_apellido
        FROM tareas t
        LEFT JOIN areas a ON t.area_id = a.id
        LEFT JOIN grupos g ON t.grupo_id = g.id
        LEFT JOIN usuarios u ON t.asignado_a_id = u.id
        WHERE t.usuario_id = %s AND t.estado != 'eliminada'
        ORDER BY t.fecha_creacion DESC
    '''
    cursor.execute(sql, (usuario_id,))
    tareas = cursor.fetchall()
    cursor.close()
    conn.close()
    return tareas

def obtener_tareas_grupo(grupo_id):
    """Obtener todas las tareas de un grupo específico"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = '''
            SELECT t.*, a.nombre AS area_nombre, a.color AS area_color, a.icono AS area_icono,
                   g.nombre AS grupo_nombre, u.nombre AS asignado_nombre, u.apellido AS asignado_apellido,
                   c.nombre AS creador_nombre, c.apellido AS creador_apellido
            FROM tareas t
            LEFT JOIN areas a ON t.area_id = a.id
            LEFT JOIN grupos g ON t.grupo_id = g.id
            LEFT JOIN usuarios u ON t.asignado_a_id = u.id
            LEFT JOIN usuarios c ON t.usuario_id = c.id
            WHERE t.grupo_id = %s AND t.estado != 'eliminada'
            ORDER BY t.fecha_creacion DESC
        '''
        
        cursor.execute(sql, (grupo_id,))
        tareas = cursor.fetchall()
        
        # Convertir fechas a string
        for tarea in tareas:
            if tarea['fecha_creacion']:
                if isinstance(tarea['fecha_creacion'], datetime):
                    tarea['fecha_creacion'] = tarea['fecha_creacion'].strftime('%Y-%m-%d %H:%M:%S')
            if tarea['fecha_vencimiento']:
                if isinstance(tarea['fecha_vencimiento'], datetime):
                    tarea['fecha_vencimiento'] = tarea['fecha_vencimiento'].strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.close()
        conn.close()
        
        print(f"🔍 [DEBUG] Tareas obtenidas para grupo {grupo_id}: {len(tareas)} tareas")
        return tareas
        
    except Exception as e:
        print(f"❌ [ERROR] Error al obtener tareas del grupo: {e}")
        return []

def obtener_tareas_asignadas_usuario(usuario_id):
    """Obtener tareas asignadas a un usuario específico"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = '''
            SELECT t.*, a.nombre AS area_nombre, a.color AS area_color, a.icono AS area_icono,
                   g.nombre AS grupo_nombre, c.nombre AS creador_nombre, c.apellido AS creador_apellido
            FROM tareas t
            LEFT JOIN areas a ON t.area_id = a.id
            LEFT JOIN grupos g ON t.grupo_id = g.id
            LEFT JOIN usuarios c ON t.usuario_id = c.id
            WHERE t.asignado_a_id = %s AND t.estado != 'eliminada'
            ORDER BY t.fecha_creacion DESC
        '''
        
        cursor.execute(sql, (usuario_id,))
        tareas = cursor.fetchall()
        
        # Convertir fechas a string
        for tarea in tareas:
            if tarea['fecha_creacion']:
                if isinstance(tarea['fecha_creacion'], datetime):
                    tarea['fecha_creacion'] = tarea['fecha_creacion'].strftime('%Y-%m-%d %H:%M:%S')
            if tarea['fecha_vencimiento']:
                if isinstance(tarea['fecha_vencimiento'], datetime):
                    tarea['fecha_vencimiento'] = tarea['fecha_vencimiento'].strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.close()
        conn.close()
        
        print(f"🔍 [DEBUG] Tareas asignadas obtenidas para usuario {usuario_id}: {len(tareas)} tareas")
        return tareas
        
    except Exception as e:
        print(f"❌ [ERROR] Error al obtener tareas asignadas: {e}")
        return []

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

@app.route('/usuarios/<int:usuario_id>', methods=['GET'])
def obtener_usuario_por_id(usuario_id):
    """Obtener un usuario específico por ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = "SELECT id, nombre, apellido, correo, telefono FROM usuarios WHERE id = %s"
        cursor.execute(sql, (usuario_id,))
        usuario = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if usuario:
            return jsonify(usuario)
        else:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
    except Exception as e:
        print(f"❌ [ERROR] Error en obtener_usuario_por_id: {e}")
        return jsonify({'error': 'Error al obtener usuario'}), 500

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
        data.get('asignado_a_id'),
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

# ===== FUNCIONES PARA GRUPOS =====

def crear_grupo(creador_id, nombre, descripcion=None, color='#3b82f6', icono='fa-users'):
    """Crear un nuevo grupo"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = "INSERT INTO grupos (creador_id, nombre, descripcion, color, icono) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(sql, (creador_id, nombre, descripcion, color, icono))
        
        grupo_id = cursor.lastrowid
        
        # Agregar el creador como líder del grupo
        sql_miembro = "INSERT INTO miembros_grupo (grupo_id, usuario_id, rol) VALUES (%s, %s, 'lider')"
        cursor.execute(sql_miembro, (grupo_id, creador_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Grupo creado exitosamente: {nombre} (ID: {grupo_id})")
        return grupo_id
    except Exception as e:
        print(f"❌ [ERROR] Error al crear grupo: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return None

def obtener_grupos_usuario(usuario_id, incluir_archivados=False):
    """Obtener todos los grupos donde el usuario es miembro"""
    try:
        print(f"🔍 [DEBUG] obtener_grupos_usuario llamado para usuario {usuario_id}, incluir_archivados: {incluir_archivados}")
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Filtrar por estado
        estado_condicion = "AND g.estado != 'eliminado'"
        if not incluir_archivados:
            estado_condicion += " AND g.estado != 'archivado'"
        
        sql = f"""
            SELECT g.*, mg.rol, 
                   (SELECT COUNT(*) FROM miembros_grupo WHERE grupo_id = g.id) as total_miembros,
                   (SELECT COUNT(*) FROM tareas WHERE grupo_id = g.id AND estado = 'completada') as tareas_completadas,
                   (SELECT COUNT(*) FROM tareas WHERE grupo_id = g.id AND estado = 'pendiente') as tareas_pendientes,
                   (SELECT COUNT(*) FROM tareas WHERE grupo_id = g.id AND estado = 'vencida') as tareas_vencidas,
                   (SELECT COUNT(*) FROM tareas WHERE grupo_id = g.id AND estado = 'pendiente' AND DATE(fecha_vencimiento) = CURDATE()) as tareas_hoy,
                   (SELECT COUNT(*) FROM tareas WHERE grupo_id = g.id AND estado != 'eliminada') as total_tareas
            FROM grupos g
            INNER JOIN miembros_grupo mg ON g.id = mg.grupo_id
            WHERE mg.usuario_id = %s {estado_condicion}
            ORDER BY g.fecha_creacion DESC
        """
        
        print(f"🔍 [DEBUG] SQL ejecutado: {sql}")
        print(f"🔍 [DEBUG] Parámetros: usuario_id = {usuario_id}")
        
        cursor.execute(sql, (usuario_id,))
        grupos = cursor.fetchall()
        
        print(f"🔍 [DEBUG] Resultado de la consulta: {len(grupos)} grupos encontrados")
        
        # Convertir fechas a string
        for grupo in grupos:
            if grupo['fecha_creacion']:
                if isinstance(grupo['fecha_creacion'], datetime):
                    grupo['fecha_creacion'] = grupo['fecha_creacion'].strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.close()
        conn.close()
        
        print(f"🔍 [DEBUG] Grupos para usuario {usuario_id} (incluir_archivados: {incluir_archivados}):")
        for grupo in grupos:
            print(f"   - ID: {grupo['id']}, Nombre: {grupo['nombre']}, Estado: {grupo['estado']}, Rol: {grupo['rol']}, Miembros: {grupo['total_miembros']}")
        
        return grupos
    except Exception as e:
        print(f"❌ [ERROR] Error al obtener grupos: {e}")
        return []

def obtener_miembros_grupo(grupo_id):
    """Obtener todos los miembros de un grupo"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = """
            SELECT u.id, u.nombre, u.apellido, u.correo, mg.rol
            FROM miembros_grupo mg
            INNER JOIN usuarios u ON mg.usuario_id = u.id
            WHERE mg.grupo_id = %s
            ORDER BY mg.rol DESC, u.nombre
        """
        cursor.execute(sql, (grupo_id,))
        miembros = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return miembros
    except Exception as e:
        print(f"❌ [ERROR] Error al obtener miembros del grupo: {e}")
        return []

def actualizar_grupo(grupo_id, nombre=None, descripcion=None, estado=None, color=None, icono=None):
    """Actualizar información de un grupo"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        updates = []
        values = []
        
        if nombre is not None:
            updates.append("nombre = %s")
            values.append(nombre)
        
        if descripcion is not None:
            updates.append("descripcion = %s")
            values.append(descripcion)
        
        if estado is not None:
            updates.append("estado = %s")
            values.append(estado)
            
        if color is not None:
            updates.append("color = %s")
            values.append(color)
            
        if icono is not None:
            updates.append("icono = %s")
            values.append(icono)
        
        if not updates:
            return False
        
        values.append(grupo_id)
        sql = f"UPDATE grupos SET {', '.join(updates)} WHERE id = %s"
        cursor.execute(sql, values)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Grupo {grupo_id} actualizado exitosamente")
        return True
    except Exception as e:
        print(f"❌ [ERROR] Error al actualizar grupo: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def eliminar_grupo(grupo_id):
    """Eliminar un grupo (soft delete)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Soft delete - cambiar estado a 'eliminado'
        cursor.execute("UPDATE grupos SET estado = 'eliminado' WHERE id = %s", (grupo_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Grupo {grupo_id} eliminado exitosamente (soft delete)")
        return True
    except Exception as e:
        print(f"❌ [ERROR] Error al eliminar grupo: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def archivar_grupo(grupo_id):
    """Archivar un grupo"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Cambiar estado a 'archivado'
        cursor.execute("UPDATE grupos SET estado = 'archivado' WHERE id = %s", (grupo_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Grupo {grupo_id} archivado exitosamente")
        return True
    except Exception as e:
        print(f"❌ [ERROR] Error al archivar grupo: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def activar_grupo(grupo_id):
    """Activar un grupo archivado"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Cambiar estado a 'activo'
        cursor.execute("UPDATE grupos SET estado = 'activo' WHERE id = %s", (grupo_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Grupo {grupo_id} activado exitosamente")
        return True
    except Exception as e:
        print(f"❌ [ERROR] Error al activar grupo: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

# ===== FUNCIONES PARA GESTIÓN DE MIEMBROS =====

def buscar_usuario_por_email(email):
    """Buscar un usuario por su email"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = "SELECT id, nombre, apellido, correo FROM usuarios WHERE correo = %s"
        cursor.execute(sql, (email,))
        usuario = cursor.fetchone()
        
        cursor.close()
        conn.close()
        return usuario
    except Exception as e:
        print(f"❌ [ERROR] Error al buscar usuario por email: {e}")
        return None

def verificar_miembro_grupo(grupo_id, usuario_id):
    """Verificar si un usuario ya es miembro de un grupo"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = "SELECT COUNT(*) FROM miembros_grupo WHERE grupo_id = %s AND usuario_id = %s"
        cursor.execute(sql, (grupo_id, usuario_id))
        count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        return count > 0
    except Exception as e:
        print(f"❌ [ERROR] Error al verificar miembro del grupo: {e}")
        return False

def verificar_lider_grupo(grupo_id, usuario_id):
    """Verificar si un usuario es líder de un grupo"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT rol FROM miembros_grupo WHERE grupo_id = %s AND usuario_id = %s", (grupo_id, usuario_id))
        resultado = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if resultado and resultado['rol'] == 'lider':
            return True
        return False
    except Exception as e:
        print(f"❌ [ERROR] Error en verificar_lider_grupo: {e}")
        return False

def verificar_puede_crear_tareas(grupo_id, usuario_id):
    """Verificar si un usuario puede crear tareas (líder o administrador)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT rol FROM miembros_grupo WHERE grupo_id = %s AND usuario_id = %s", (grupo_id, usuario_id))
        resultado = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if resultado and resultado['rol'] in ['lider']:
            return True
        return False
    except Exception as e:
        print(f"❌ [ERROR] Error en verificar_puede_crear_tareas: {e}")
        return False

def agregar_miembro_grupo(grupo_id, usuario_id, rol='miembro'):
    """Agregar un usuario como miembro de un grupo"""
    try:
        print(f"🔍 [DEBUG] agregar_miembro_grupo llamado con grupo_id: {grupo_id}, usuario_id: {usuario_id}, rol: {rol}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        print(f"✅ [DEBUG] Conexión a BD establecida")
        
        # Verificar si ya es miembro
        if verificar_miembro_grupo(grupo_id, usuario_id):
            print(f"⚠️ [WARN] Usuario {usuario_id} ya es miembro del grupo {grupo_id}")
            return False
        
        print(f"✅ [DEBUG] Usuario no es miembro existente")
        
        # Verificar si ya tiene una invitación pendiente
        cursor.execute("SELECT id FROM invitaciones_grupo WHERE grupo_id = %s AND usuario_id = %s AND estado = 'pendiente'", (grupo_id, usuario_id))
        invitacion_existente = cursor.fetchone()
        
        if invitacion_existente:
            print(f"⚠️ [WARN] Usuario {usuario_id} ya tiene una invitación pendiente para el grupo {grupo_id}")
            return False
        
        # Si hay una invitación rechazada, la eliminamos para crear una nueva
        cursor.execute("DELETE FROM invitaciones_grupo WHERE grupo_id = %s AND usuario_id = %s AND estado = 'rechazada'", (grupo_id, usuario_id))
        if cursor.rowcount > 0:
            print(f"🗑️ [DEBUG] Eliminada invitación rechazada anterior para usuario {usuario_id}")
        
        print(f"✅ [DEBUG] No hay invitación pendiente existente")
        
        # Crear invitación pendiente
        sql = "INSERT INTO invitaciones_grupo (grupo_id, usuario_id, rol) VALUES (%s, %s, %s)"
        print(f"🔍 [DEBUG] SQL a ejecutar: {sql}")
        print(f"🔍 [DEBUG] Parámetros: grupo_id={grupo_id}, usuario_id={usuario_id}, rol={rol}")
        
        cursor.execute(sql, (grupo_id, usuario_id, rol))
        
        print(f"✅ [DEBUG] SQL ejecutado exitosamente")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Invitación creada para usuario {usuario_id} al grupo {grupo_id} como {rol}")
        
        # Crear notificación para el usuario invitado
        notificar_invitacion_grupo(grupo_id, usuario_id, rol)
        
        return True
    except Exception as e:
        print(f"❌ [ERROR] Error al crear invitación: {e}")
        print(f"❌ [ERROR] Tipo de error: {type(e).__name__}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def remover_miembro_grupo(grupo_id, usuario_id):
    """Remover un usuario de un grupo"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar si el usuario es el creador del grupo
        cursor.execute("SELECT creador_id FROM grupos WHERE id = %s", (grupo_id,))
        grupo = cursor.fetchone()
        
        if grupo and grupo[0] == usuario_id:
            print(f"⚠️ [WARN] No se puede remover al creador del grupo")
            cursor.close()
            conn.close()
            return False
        
        # Remover miembro
        sql = "DELETE FROM miembros_grupo WHERE grupo_id = %s AND usuario_id = %s"
        cursor.execute(sql, (grupo_id, usuario_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Usuario {usuario_id} removido del grupo {grupo_id}")
        
        # Crear notificación para el usuario removido
        notificar_remocion_grupo(grupo_id, usuario_id)
        
        return True
    except Exception as e:
        print(f"❌ [ERROR] Error al remover miembro del grupo: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def cambiar_rol_miembro(grupo_id, usuario_id, nuevo_rol):
    """Cambiar el rol de un miembro en un grupo"""
    try:
        print(f"🔍 [DEBUG] cambiar_rol_miembro llamado con grupo_id: {grupo_id}, usuario_id: {usuario_id}, nuevo_rol: {nuevo_rol}")
        
        print(f"🔍 [DEBUG] Obteniendo conexión a BD...")
        conn = get_db_connection()
        print(f"✅ [DEBUG] Conexión obtenida")
        
        print(f"🔍 [DEBUG] Creando cursor...")
        cursor = conn.cursor()
        print(f"✅ [DEBUG] Cursor creado")
        
        # Verificar si el usuario es el creador del grupo
        cursor.execute("SELECT creador_id FROM grupos WHERE id = %s", (grupo_id,))
        grupo = cursor.fetchone()
        
        print(f"📋 [DEBUG] Creador del grupo: {grupo[0] if grupo else None}")
        print(f"📋 [DEBUG] Usuario a cambiar: {usuario_id}")
        
        if grupo and grupo[0] == usuario_id:
            print(f"⚠️ [WARN] No se puede cambiar el rol del creador del grupo")
            cursor.close()
            conn.close()
            return False
        
        # Verificar que el miembro existe
        cursor.execute("SELECT rol FROM miembros_grupo WHERE grupo_id = %s AND usuario_id = %s", (grupo_id, usuario_id))
        miembro = cursor.fetchone()
        
        if not miembro:
            print(f"❌ [ERROR] El usuario {usuario_id} no es miembro del grupo {grupo_id}")
            cursor.close()
            conn.close()
            return False
        
        print(f"📋 [DEBUG] Rol actual del miembro: {miembro[0]}")
        
        # Cambiar rol
        sql = "UPDATE miembros_grupo SET rol = %s WHERE grupo_id = %s AND usuario_id = %s"
        print(f"🔍 [DEBUG] Ejecutando SQL: {sql} con valores: ({nuevo_rol}, {grupo_id}, {usuario_id})")
        cursor.execute(sql, (nuevo_rol, grupo_id, usuario_id))
        
        # Verificar que se actualizó correctamente
        filas_afectadas = cursor.rowcount
        print(f"📋 [DEBUG] Filas afectadas por el UPDATE: {filas_afectadas}")
        
        print(f"🔍 [DEBUG] Haciendo commit...")
        conn.commit()
        print(f"✅ [DEBUG] Commit exitoso")
        
        print(f"🔍 [DEBUG] Cerrando cursor y conexión...")
        cursor.close()
        conn.close()
        print(f"✅ [DEBUG] Conexión cerrada")
        
        print(f"✅ [SUCCESS] Rol de usuario {usuario_id} cambiado a {nuevo_rol} en grupo {grupo_id}")
        
        # Crear notificación para el usuario cuyo rol cambió
        # notificar_cambio_rol(grupo_id, usuario_id, nuevo_rol)  # Comentado temporalmente
        
        return True
    except Exception as e:
        print(f"❌ [ERROR] Error al cambiar rol del miembro: {e}")
        import traceback
        traceback.print_exc()
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def obtener_usuarios_disponibles(grupo_id):
    """Obtener usuarios que no son miembros del grupo"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = """
            SELECT u.id, u.nombre, u.apellido, u.correo
            FROM usuarios u
            WHERE u.id NOT IN (
                SELECT mg.usuario_id 
                FROM miembros_grupo mg 
                WHERE mg.grupo_id = %s
            )
            ORDER BY u.nombre, u.apellido
        """
        cursor.execute(sql, (grupo_id,))
        usuarios = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return usuarios
    except Exception as e:
        print(f"❌ [ERROR] Error al obtener usuarios disponibles: {e}")
        return []

# ===== FUNCIONES PARA NOTIFICACIONES =====

def crear_notificacion(usuario_id, tipo, titulo, mensaje, datos_adicionales=None):
    """Crear una nueva notificación para un usuario"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = """
            INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_adicionales)
            VALUES (%s, %s, %s, %s, %s)
        """
        
        # Convertir datos_adicionales a JSON string si existe
        datos_json = None
        if datos_adicionales:
            datos_json = json.dumps(datos_adicionales)
        
        cursor.execute(sql, (usuario_id, tipo, titulo, mensaje, datos_json))
        notificacion_id = cursor.lastrowid
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Notificación creada para usuario {usuario_id}: {titulo}")
        return notificacion_id
    except Exception as e:
        print(f"❌ [ERROR] Error al crear notificación: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return None

def obtener_notificaciones_usuario(usuario_id, solo_no_leidas=False):
    """Obtener notificaciones de un usuario"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = """
            SELECT id, tipo, titulo, mensaje, datos_adicionales, leida, fecha_creacion
            FROM notificaciones 
            WHERE usuario_id = %s
        """
        
        if solo_no_leidas:
            sql += " AND leida = FALSE"
        
        sql += " ORDER BY fecha_creacion DESC"
        
        cursor.execute(sql, (usuario_id,))
        notificaciones = cursor.fetchall()
        
        # Convertir fechas a string y parsear JSON
        for notif in notificaciones:
            if notif['fecha_creacion']:
                if isinstance(notif['fecha_creacion'], datetime):
                    notif['fecha_creacion'] = notif['fecha_creacion'].strftime('%Y-%m-%d %H:%M:%S')
            
            if notif['datos_adicionales']:
                try:
                    notif['datos_adicionales'] = json.loads(notif['datos_adicionales'])
                except:
                    notif['datos_adicionales'] = {}
        
        cursor.close()
        conn.close()
        return notificaciones
    except Exception as e:
        print(f"❌ [ERROR] Error al obtener notificaciones: {e}")
        return []

def marcar_notificacion_leida(notificacion_id):
    """Marcar una notificación como leída"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = "UPDATE notificaciones SET leida = TRUE WHERE id = %s"
        cursor.execute(sql, (notificacion_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Notificación {notificacion_id} marcada como leída")
        return True
    except Exception as e:
        print(f"❌ [ERROR] Error al marcar notificación como leída: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def marcar_todas_notificaciones_leidas(usuario_id):
    """Marcar todas las notificaciones de un usuario como leídas"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = "UPDATE notificaciones SET leida = TRUE WHERE usuario_id = %s"
        cursor.execute(sql, (usuario_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Todas las notificaciones de usuario {usuario_id} marcadas como leídas")
        return True
    except Exception as e:
        print(f"❌ [ERROR] Error al marcar todas las notificaciones como leídas: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def eliminar_notificacion(notificacion_id):
    """Eliminar una notificación"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = "DELETE FROM notificaciones WHERE id = %s"
        cursor.execute(sql, (notificacion_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Notificación {notificacion_id} eliminada")
        return True
    except Exception as e:
        print(f"❌ [ERROR] Error al eliminar notificación: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def contar_notificaciones_no_leidas(usuario_id):
    """Contar notificaciones no leídas de un usuario"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = "SELECT COUNT(*) FROM notificaciones WHERE usuario_id = %s AND leida = FALSE"
        cursor.execute(sql, (usuario_id,))
        count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        return count
    except Exception as e:
        print(f"❌ [ERROR] Error al contar notificaciones no leídas: {e}")
        return 0

# ===== FUNCIONES ESPECÍFICAS DE NOTIFICACIONES DE GRUPOS =====

def notificar_invitacion_grupo(grupo_id, usuario_id, rol):
    """Crear notificación cuando se invita a un usuario a un grupo"""
    try:
        # Obtener información del grupo
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT nombre FROM grupos WHERE id = %s", (grupo_id,))
        grupo = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not grupo:
            return False
        
        titulo = f"Nueva invitación a grupo"
        mensaje = f"Has sido invitado al grupo '{grupo['nombre']}' como {rol}. Revisa tus invitaciones para aceptar o rechazar."
        datos = {
            'grupo_id': grupo_id,
            'grupo_nombre': grupo['nombre'],
            'rol': rol,
            'tipo': 'grupo_invitacion'
        }
        
        return crear_notificacion(usuario_id, 'grupo_invitacion', titulo, mensaje, datos)
    except Exception as e:
        print(f"❌ [ERROR] Error al crear notificación de invitación: {e}")
        return None

def notificar_cambio_rol(grupo_id, usuario_id, nuevo_rol):
    """Crear notificación cuando cambia el rol de un usuario"""
    try:
        # Obtener información del grupo
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT nombre FROM grupos WHERE id = %s", (grupo_id,))
        grupo = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not grupo:
            return False
        
        titulo = f"Cambio de rol en grupo"
        mensaje = f"Tu rol en el grupo '{grupo['nombre']}' ha cambiado a {nuevo_rol}."
        datos = {
            'grupo_id': grupo_id,
            'grupo_nombre': grupo['nombre'],
            'nuevo_rol': nuevo_rol,
            'tipo': 'grupo_rol_cambio'
        }
        
        return crear_notificacion(usuario_id, 'grupo_rol_cambio', titulo, mensaje, datos)
    except Exception as e:
        print(f"❌ [ERROR] Error al crear notificación de cambio de rol: {e}")
        return None

def notificar_remocion_grupo(grupo_id, usuario_id):
    """Crear notificación cuando se remueve un usuario de un grupo"""
    try:
        # Obtener información del grupo
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT nombre FROM grupos WHERE id = %s", (grupo_id,))
        grupo = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not grupo:
            return False
        
        titulo = f"Removido de grupo"
        mensaje = f"Has sido removido del grupo '{grupo['nombre']}'."
        datos = {
            'grupo_id': grupo_id,
            'grupo_nombre': grupo['nombre'],
            'tipo': 'grupo_removido'
        }
        
        return crear_notificacion(usuario_id, 'grupo_removido', titulo, mensaje, datos)
    except Exception as e:
        print(f"❌ [ERROR] Error al crear notificación de remoción: {e}")
        return None

def notificar_tarea_asignada(tarea_id, grupo_id, usuario_id, titulo_tarea):
    """Crear notificación cuando se asigna una tarea a un usuario"""
    try:
        # Obtener información del grupo
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT nombre FROM grupos WHERE id = %s", (grupo_id,))
        grupo = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not grupo:
            return False
        
        titulo = f"Nueva tarea asignada"
        mensaje = f"Te han asignado la tarea '{titulo_tarea}' en el grupo '{grupo['nombre']}'."
        datos = {
            'tarea_id': tarea_id,
            'grupo_id': grupo_id,
            'grupo_nombre': grupo['nombre'],
            'titulo_tarea': titulo_tarea,
            'tipo': 'tarea_asignada'
        }
        
        return crear_notificacion(usuario_id, 'tarea_asignada', titulo, mensaje, datos)
    except Exception as e:
        print(f"❌ [ERROR] Error al crear notificación de tarea asignada: {e}")
        return None

# ===== ENDPOINTS PARA GRUPOS =====

@app.route('/grupos', methods=['POST'])
def crear_grupo_endpoint():
    """Crear un nuevo grupo"""
    try:
        data = request.json
        nombre = data.get('nombre')
        descripcion = data.get('descripcion')
        color = data.get('color', '#3b82f6')
        icono = data.get('icono', 'fa-users')
        creador_id = data.get('creador_id')
        
        if not nombre or not creador_id:
            return jsonify({'error': 'Nombre y creador_id son requeridos'}), 400
        
        grupo_id = crear_grupo(creador_id, nombre, descripcion, color, icono)
        
        if grupo_id:
            return jsonify({
                'mensaje': 'Grupo creado exitosamente',
                'grupo_id': grupo_id
            })
        else:
            return jsonify({'error': 'Error al crear el grupo'}), 500
            
    except Exception as e:
        print(f"❌ [ERROR] Error en crear_grupo_endpoint: {e}")
        return jsonify({'error': 'Error al crear el grupo'}), 500

@app.route('/grupos/<int:usuario_id>', methods=['GET'])
def listar_grupos(usuario_id):
    """Obtener todos los grupos del usuario incluyendo invitaciones pendientes"""
    try:
        print(f"🔍 [DEBUG] Endpoint /grupos/{usuario_id} llamado")
        
        # Obtener grupos normales
        grupos = obtener_grupos_usuario(usuario_id)
        
        # Obtener invitaciones pendientes
        invitaciones = obtener_invitaciones_pendientes_usuario(usuario_id)
        
        # Combinar grupos e invitaciones
        resultado = {
            'grupos': grupos,
            'invitaciones': invitaciones
        }
        
        print(f"📦 [DEBUG] Endpoint devolviendo {len(grupos)} grupos y {len(invitaciones)} invitaciones")
        return jsonify(resultado)
    except Exception as e:
        print(f"❌ [ERROR] Error en listar_grupos: {e}")
        return jsonify({'error': 'Error al obtener grupos'}), 500

@app.route('/grupos/<int:grupo_id>/miembros', methods=['GET'])
def listar_miembros_grupo(grupo_id):
    """Obtener miembros de un grupo"""
    try:
        miembros = obtener_miembros_grupo(grupo_id)
        return jsonify(miembros)
    except Exception as e:
        print(f"❌ [ERROR] Error en listar_miembros_grupo: {e}")
        return jsonify({'error': 'Error al obtener miembros'}), 500

@app.route('/grupos/<int:grupo_id>', methods=['PUT'])
def actualizar_grupo_endpoint(grupo_id):
    """Actualizar información de un grupo"""
    try:
        data = request.json
        print(f"🔍 [DEBUG] Datos recibidos para actualizar grupo {grupo_id}:", data)
        
        nombre = data.get('nombre')
        descripcion = data.get('descripcion')
        color = data.get('color')
        icono = data.get('icono')
        
        print(f"🔍 [DEBUG] Valores extraídos:")
        print(f"  - nombre: {nombre}")
        print(f"  - descripcion: {descripcion}")
        print(f"  - color: {color}")
        print(f"  - icono: {icono}")
        
        success = actualizar_grupo(grupo_id, nombre, descripcion, color=color, icono=icono)
        if success:
            print(f"✅ [SUCCESS] Grupo {grupo_id} actualizado exitosamente")
            return jsonify({'mensaje': 'Grupo actualizado exitosamente'})
        else:
            print(f"❌ [ERROR] Error al actualizar grupo {grupo_id}")
            return jsonify({'error': 'Error al actualizar el grupo'}), 500
            
    except Exception as e:
        print(f"❌ [ERROR] Error en actualizar_grupo_endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Error al actualizar el grupo'}), 500

@app.route('/grupos/<int:grupo_id>', methods=['DELETE'])
def eliminar_grupo_endpoint(grupo_id):
    """Eliminar un grupo"""
    try:
        success = eliminar_grupo(grupo_id)
        if success:
            return jsonify({'mensaje': 'Grupo eliminado exitosamente'})
        else:
            return jsonify({'error': 'Error al eliminar el grupo'}), 500
            
    except Exception as e:
        print(f"❌ [ERROR] Error en eliminar_grupo_endpoint: {e}")
        return jsonify({'error': 'Error al eliminar el grupo'}), 500

@app.route('/grupos/<int:grupo_id>/archivar', methods=['PUT'])
def archivar_grupo_endpoint(grupo_id):
    """Archivar un grupo"""
    try:
        success = archivar_grupo(grupo_id)
        if success:
            return jsonify({'mensaje': 'Grupo archivado exitosamente'})
        else:
            return jsonify({'error': 'Error al archivar el grupo'}), 500
            
    except Exception as e:
        print(f"❌ [ERROR] Error en archivar_grupo_endpoint: {e}")
        return jsonify({'error': 'Error al archivar el grupo'}), 500

@app.route('/grupos/<int:grupo_id>/activar', methods=['PUT'])
def activar_grupo_endpoint(grupo_id):
    """Activar un grupo archivado"""
    try:
        success = activar_grupo(grupo_id)
        if success:
            return jsonify({'mensaje': 'Grupo activado exitosamente'})
        else:
            return jsonify({'error': 'Error al activar el grupo'}), 500
            
    except Exception as e:
        print(f"❌ [ERROR] Error en activar_grupo_endpoint: {e}")
        return jsonify({'error': 'Error al activar el grupo'}), 500

@app.route('/grupos/<int:usuario_id>/archivados', methods=['GET'])
def listar_grupos_archivados(usuario_id):
    """Obtener grupos archivados del usuario"""
    try:
        grupos = obtener_grupos_usuario(usuario_id, incluir_archivados=True)
        # Filtrar solo los archivados
        grupos_archivados = [g for g in grupos if g['estado'] == 'archivado']
        return jsonify(grupos_archivados)
    except Exception as e:
        print(f"❌ [ERROR] Error en listar_grupos_archivados: {e}")
        return jsonify({'error': 'Error al obtener grupos archivados'}), 500

# ===== ENDPOINTS PARA GESTIÓN DE MIEMBROS =====

@app.route('/grupos/<int:grupo_id>/miembros/agregar', methods=['POST'])
def agregar_miembro_endpoint(grupo_id):
    """Agregar un miembro a un grupo por email (crea invitación)"""
    try:
        data = request.json
        email = data.get('email')
        rol = data.get('rol', 'miembro')
        
        if not email:
            return jsonify({'error': 'Email es requerido'}), 400
        
        # Buscar usuario por email
        usuario = buscar_usuario_por_email(email)
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado con ese email'}), 404
        
        # Verificar si ya es miembro
        if verificar_miembro_grupo(grupo_id, usuario['id']):
            return jsonify({'error': 'El usuario ya es miembro del grupo'}), 400
        
        # Crear invitación (en lugar de agregar directamente)
        success = agregar_miembro_grupo(grupo_id, usuario['id'], rol)
        if success:
            return jsonify({
                'mensaje': 'Invitación enviada exitosamente',
                'usuario': {
                    'id': usuario['id'],
                    'nombre': usuario['nombre'],
                    'apellido': usuario['apellido'],
                    'email': usuario['correo'],
                    'rol': rol
                }
            })
        else:
            return jsonify({'error': 'Error al enviar invitación'}), 500
            
    except Exception as e:
        print(f"❌ [ERROR] Error en agregar_miembro_endpoint: {e}")
        return jsonify({'error': 'Error al enviar invitación'}), 500

@app.route('/grupos/<int:grupo_id>/miembros/<int:usuario_id>', methods=['DELETE'])
def remover_miembro_endpoint(grupo_id, usuario_id):
    """Remover un miembro de un grupo"""
    try:
        success = remover_miembro_grupo(grupo_id, usuario_id)
        if success:
            return jsonify({'mensaje': 'Miembro removido exitosamente'})
        else:
            # Verificar si es el creador del grupo
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT creador_id FROM grupos WHERE id = %s", (grupo_id,))
            grupo = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if grupo and grupo[0] == usuario_id:
                return jsonify({'error': 'No se puede remover al creador del grupo'}), 400
            else:
                return jsonify({'error': 'Error al remover el miembro del grupo'}), 400
            
    except Exception as e:
        print(f"❌ [ERROR] Error en remover_miembro_endpoint: {e}")
        return jsonify({'error': 'Error al remover miembro'}), 500

@app.route('/grupos/<int:grupo_id>/miembros/<int:usuario_id>/rol', methods=['PUT'])
def cambiar_rol_miembro_endpoint(grupo_id, usuario_id):
    """Cambiar el rol de un miembro"""
    try:
        print(f"🔍 [DEBUG] cambiar_rol_miembro_endpoint llamado con grupo_id: {grupo_id}, usuario_id: {usuario_id}")
        
        data = request.json
        nuevo_rol = data.get('rol')
        
        print(f"📦 [DEBUG] Datos recibidos: {data}")
        print(f"🎯 [DEBUG] Nuevo rol: {nuevo_rol}")
        
        if not nuevo_rol:
            print(f"❌ [ERROR] Rol no proporcionado")
            return jsonify({'error': 'Rol no proporcionado'}), 400
        
        # Usar la misma lógica que el endpoint de prueba que funciona
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar que el miembro existe
        cursor.execute("SELECT rol FROM miembros_grupo WHERE grupo_id = %s AND usuario_id = %s", (grupo_id, usuario_id))
        miembro = cursor.fetchone()
        
        if not miembro:
            print(f"❌ [ERROR] El usuario {usuario_id} no es miembro del grupo {grupo_id}")
            cursor.close()
            conn.close()
            return jsonify({'error': 'Miembro no encontrado'}), 404
        
        print(f"📋 [DEBUG] Rol actual del miembro: {miembro[0]}")
        
        # Cambiar rol
        sql = "UPDATE miembros_grupo SET rol = %s WHERE grupo_id = %s AND usuario_id = %s"
        cursor.execute(sql, (nuevo_rol, grupo_id, usuario_id))
        
        # Verificar que se actualizó correctamente
        filas_afectadas = cursor.rowcount
        print(f"📋 [DEBUG] Filas afectadas por el UPDATE: {filas_afectadas}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Rol actualizado exitosamente")
        return jsonify({'mensaje': 'Rol actualizado exitosamente'})
        
    except Exception as e:
        print(f"❌ [ERROR] Error en cambiar_rol_miembro_endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Error al cambiar rol'}), 500

@app.route('/grupos/<int:grupo_id>/usuarios-disponibles', methods=['GET'])
def listar_usuarios_disponibles(grupo_id):
    """Obtener usuarios que no son miembros del grupo"""
    try:
        usuarios = obtener_usuarios_disponibles(grupo_id)
        return jsonify(usuarios)
    except Exception as e:
        print(f"❌ [ERROR] Error en listar_usuarios_disponibles: {e}")
        return jsonify({'error': 'Error al obtener usuarios disponibles'}), 500

@app.route('/grupos/<int:grupo_id>/miembros-completos', methods=['GET'])
def listar_miembros_completos(grupo_id):
    """Obtener información completa de todos los miembros del grupo"""
    try:
        print(f"🔍 [DEBUG] listar_miembros_completos llamado con grupo_id: {grupo_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query simple que sabemos que funciona
        sql = """
            SELECT mg.usuario_id, mg.rol, mg.fecha_union,
                   u.nombre, u.apellido, u.correo
            FROM miembros_grupo mg
            INNER JOIN usuarios u ON mg.usuario_id = u.id
            WHERE mg.grupo_id = %s
            ORDER BY mg.rol DESC, u.nombre ASC
        """
        
        cursor.execute(sql, (grupo_id,))
        miembros = cursor.fetchall()
        
        print(f"📦 [DEBUG] Miembros encontrados: {len(miembros)}")
        
        # Convertir fechas a string de forma más segura
        for miembro in miembros:
            if miembro['fecha_union']:
                try:
                    if isinstance(miembro['fecha_union'], datetime):
                        miembro['fecha_union'] = miembro['fecha_union'].strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        miembro['fecha_union'] = str(miembro['fecha_union'])
                except Exception as date_error:
                    print(f"⚠️ [WARNING] Error al convertir fecha: {date_error}")
                    miembro['fecha_union'] = str(miembro['fecha_union'])
        
        cursor.close()
        conn.close()
        
        print(f"✅ [DEBUG] Retornando {len(miembros)} miembros")
        return jsonify(miembros)
        
    except Exception as e:
        print(f"❌ [ERROR] Error en listar_miembros_completos: {e}")
        import traceback
        print(f"📋 [DEBUG] Traceback completo:")
        traceback.print_exc()
        return jsonify({'error': 'Error al obtener miembros del grupo'}), 500

@app.route('/usuarios/buscar/<email>', methods=['GET'])
def buscar_usuario_endpoint(email):
    """Buscar un usuario por email"""
    try:
        usuario = buscar_usuario_por_email(email)
        if usuario:
            return jsonify(usuario)
        else:
            return jsonify({'error': 'Usuario no encontrado'}), 404
    except Exception as e:
        print(f"❌ [ERROR] Error en buscar_usuario_endpoint: {e}")
        return jsonify({'error': 'Error al buscar usuario'}), 500

# ===== ENDPOINTS PARA NOTIFICACIONES =====

@app.route('/notificaciones/<int:usuario_id>', methods=['GET'])
def listar_notificaciones(usuario_id):
    """Obtener notificaciones de un usuario"""
    try:
        solo_no_leidas = request.args.get('solo_no_leidas', 'false').lower() == 'true'
        notificaciones = obtener_notificaciones_usuario(usuario_id, solo_no_leidas)
        return jsonify(notificaciones)
    except Exception as e:
        print(f"❌ [ERROR] Error en listar_notificaciones: {e}")
        return jsonify({'error': 'Error al obtener notificaciones'}), 500

@app.route('/notificaciones/<int:notificacion_id>/leer', methods=['PUT'])
def marcar_notificacion_leida_endpoint(notificacion_id):
    """Marcar una notificación como leída"""
    try:
        success = marcar_notificacion_leida(notificacion_id)
        if success:
            return jsonify({'mensaje': 'Notificación marcada como leída'})
        else:
            return jsonify({'error': 'Error al marcar notificación como leída'}), 500
    except Exception as e:
        print(f"❌ [ERROR] Error en marcar_notificacion_leida_endpoint: {e}")
        return jsonify({'error': 'Error al marcar notificación como leída'}), 500

@app.route('/notificaciones/<int:usuario_id>/leer-todas', methods=['PUT'])
def marcar_todas_notificaciones_leidas_endpoint(usuario_id):
    """Marcar todas las notificaciones de un usuario como leídas"""
    try:
        success = marcar_todas_notificaciones_leidas(usuario_id)
        if success:
            return jsonify({'mensaje': 'Todas las notificaciones marcadas como leídas'})
        else:
            return jsonify({'error': 'Error al marcar notificaciones como leídas'}), 500
    except Exception as e:
        print(f"❌ [ERROR] Error en marcar_todas_notificaciones_leidas_endpoint: {e}")
        return jsonify({'error': 'Error al marcar notificaciones como leídas'}), 500

@app.route('/notificaciones/<int:notificacion_id>', methods=['DELETE'])
def eliminar_notificacion_endpoint(notificacion_id):
    """Eliminar una notificación"""
    try:
        success = eliminar_notificacion(notificacion_id)
        if success:
            return jsonify({'mensaje': 'Notificación eliminada'})
        else:
            return jsonify({'error': 'Error al eliminar notificación'}), 500
    except Exception as e:
        print(f"❌ [ERROR] Error en eliminar_notificacion_endpoint: {e}")
        return jsonify({'error': 'Error al eliminar notificación'}), 500

@app.route('/notificaciones/<int:usuario_id>/contar-no-leidas', methods=['GET'])
def contar_notificaciones_no_leidas_endpoint(usuario_id):
    """Contar notificaciones no leídas de un usuario"""
    try:
        count = contar_notificaciones_no_leidas(usuario_id)
        return jsonify({'count': count})
    except Exception as e:
        print(f"❌ [ERROR] Error en contar_notificaciones_no_leidas_endpoint: {e}")
        return jsonify({'error': 'Error al contar notificaciones'}), 500

# ===== ENDPOINT DE DEBUG =====

@app.route('/debug/grupos/<int:usuario_id>', methods=['GET'])
def debug_grupos_usuario(usuario_id):
    """Endpoint de debug para verificar grupos de un usuario"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verificar si el usuario existe
        cursor.execute("SELECT id, nombre, apellido, correo FROM usuarios WHERE id = %s", (usuario_id,))
        usuario = cursor.fetchone()
        
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar todos los grupos
        cursor.execute("SELECT * FROM grupos ORDER BY id")
        todos_grupos = cursor.fetchall()
        
        # Verificar todos los miembros_grupo
        cursor.execute("SELECT * FROM miembros_grupo ORDER BY grupo_id, usuario_id")
        todos_miembros = cursor.fetchall()
        
        # Verificar miembros específicos del usuario
        cursor.execute("SELECT mg.*, g.nombre as grupo_nombre, g.estado as grupo_estado FROM miembros_grupo mg INNER JOIN grupos g ON mg.grupo_id = g.id WHERE mg.usuario_id = %s", (usuario_id,))
        miembros_usuario = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        debug_info = {
            'usuario': usuario,
            'total_grupos': len(todos_grupos),
            'total_miembros': len(todos_miembros),
            'miembros_del_usuario': len(miembros_usuario),
            'todos_grupos': todos_grupos,
            'todos_miembros': todos_miembros,
            'miembros_usuario': miembros_usuario
        }
        
        return jsonify(debug_info)
        
    except Exception as e:
        print(f"❌ [ERROR] Error en debug_grupos_usuario: {e}")
        return jsonify({'error': f'Error de debug: {str(e)}'}), 500

# ===== ENDPOINTS PARA TAREAS EN GRUPOS =====

@app.route('/grupos/<int:grupo_id>/tareas', methods=['GET'])
def listar_tareas_grupo(grupo_id):
    """Obtener todas las tareas de un grupo"""
    try:
        tareas = obtener_tareas_grupo(grupo_id)
        return jsonify(tareas)
    except Exception as e:
        print(f"❌ [ERROR] Error en listar_tareas_grupo: {e}")
        return jsonify({'error': 'Error al obtener tareas del grupo'}), 500

@app.route('/grupos/<int:grupo_id>/tareas', methods=['POST'])
def crear_tarea_grupo(grupo_id):
    """Crear una nueva tarea en un grupo"""
    try:
        data = request.json
        titulo = data.get('titulo')
        descripcion = data.get('descripcion', '')
        area_id = data.get('area_id')
        asignado_a_id = data.get('asignado_a_id')  # Para asignación individual
        asignados_ids = data.get('asignados_ids')  # Para asignación múltiple
        fecha_vencimiento = data.get('fecha_vencimiento')
        usuario_id = data.get('usuario_id')  # ID del creador de la tarea
        
        if not titulo or not usuario_id:
            return jsonify({'error': 'Título y usuario_id son requeridos'}), 400
        
        # Verificar que el usuario pueda crear tareas (líder o administrador)
        if not verificar_puede_crear_tareas(grupo_id, usuario_id):
            return jsonify({'error': 'Solo los líderes y administradores del grupo pueden crear tareas'}), 403
        
        # Si se usa asignación múltiple
        if asignados_ids and isinstance(asignados_ids, list):
            # Verificar que todos los usuarios asignados sean miembros del grupo
            for asignado_id in asignados_ids:
                if not verificar_miembro_grupo(grupo_id, asignado_id):
                    return jsonify({'error': f'El usuario {asignado_id} no es miembro del grupo'}), 403
            
            task_ids = crear_tarea_grupo_multiple(usuario_id, titulo, descripcion, grupo_id, asignados_ids, area_id, fecha_vencimiento)
            
            if task_ids:
                return jsonify({
                    'mensaje': f'Tareas creadas exitosamente para {len(task_ids)} miembros',
                    'task_ids': task_ids,
                    'tareas_creadas': len(task_ids)
                })
            else:
                return jsonify({'error': 'Error al crear las tareas'}), 500
        
        # Si se usa asignación individual
        else:
            # Si se asigna a alguien, verificar que sea miembro del grupo
            if asignado_a_id and not verificar_miembro_grupo(grupo_id, asignado_a_id):
                return jsonify({'error': 'El usuario asignado no es miembro del grupo'}), 403
            
            task_id = crear_tarea(usuario_id, titulo, descripcion, area_id, grupo_id, asignado_a_id, fecha_vencimiento)
            
            if task_id:
                return jsonify({'mensaje': 'Tarea creada exitosamente', 'task_id': task_id})
            else:
                return jsonify({'error': 'Error al crear la tarea'}), 500
            
    except Exception as e:
        print(f"❌ [ERROR] Error en crear_tarea_grupo: {e}")
        return jsonify({'error': 'Error al crear la tarea'}), 500

@app.route('/usuarios/<int:usuario_id>/tareas-asignadas', methods=['GET'])
def listar_tareas_asignadas(usuario_id):
    """Obtener tareas asignadas a un usuario"""
    try:
        tareas = obtener_tareas_asignadas_usuario(usuario_id)
        return jsonify(tareas)
    except Exception as e:
        print(f"❌ [ERROR] Error en listar_tareas_asignadas: {e}")
        return jsonify({'error': 'Error al obtener tareas asignadas'}), 500

@app.route('/debug/grupo/<int:grupo_id>', methods=['GET'])
def debug_grupo_especifico(grupo_id):
    """Debug: Verificar un grupo específico y sus miembros"""
    try:
        print(f"🔍 [DEBUG] debug_grupo_especifico llamado con grupo_id: {grupo_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verificar si el grupo existe
        sql_grupo = "SELECT * FROM grupos WHERE id = %s"
        cursor.execute(sql_grupo, (grupo_id,))
        grupo = cursor.fetchone()
        
        if not grupo:
            print(f"❌ [ERROR] Grupo {grupo_id} no encontrado")
            return jsonify({'error': f'Grupo {grupo_id} no encontrado'}), 404
        
        # Verificar miembros del grupo
        sql_miembros = """
            SELECT mg.*, u.nombre, u.apellido, u.correo
            FROM miembros_grupo mg
            LEFT JOIN usuarios u ON mg.usuario_id = u.id
            WHERE mg.grupo_id = %s
            ORDER BY mg.rol DESC, u.nombre ASC
        """
        cursor.execute(sql_miembros, (grupo_id,))
        miembros = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        debug_info = {
            'grupo_id': grupo_id,
            'grupo': grupo,
            'miembros': miembros,
            'total_miembros': len(miembros)
        }
        
        print(f"✅ [DEBUG] Debug info para grupo {grupo_id}: {debug_info}")
        return jsonify(debug_info)
        
    except Exception as e:
        print(f"❌ [ERROR] Error en debug_grupo_especifico: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/test/miembros-simple/<int:grupo_id>', methods=['GET'])
def test_miembros_simple(grupo_id):
    """Test simple para verificar si el problema es específico del endpoint"""
    try:
        print(f"🧪 [TEST] test_miembros_simple llamado con grupo_id: {grupo_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query simple
        sql = "SELECT usuario_id, rol FROM miembros_grupo WHERE grupo_id = %s"
        cursor.execute(sql, (grupo_id,))
        miembros = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        print(f"✅ [TEST] Miembros encontrados: {len(miembros)}")
        return jsonify({'miembros': miembros, 'total': len(miembros)})
        
    except Exception as e:
        print(f"❌ [TEST] Error en test_miembros_simple: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/test/cambiar-rol/<int:grupo_id>/<int:usuario_id>/<nuevo_rol>', methods=['GET'])
def test_cambiar_rol(grupo_id, usuario_id, nuevo_rol):
    """Test simple para cambiar rol directamente"""
    try:
        print(f"🧪 [TEST] test_cambiar_rol llamado con grupo_id: {grupo_id}, usuario_id: {usuario_id}, nuevo_rol: {nuevo_rol}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar que el miembro existe
        cursor.execute("SELECT rol FROM miembros_grupo WHERE grupo_id = %s AND usuario_id = %s", (grupo_id, usuario_id))
        miembro = cursor.fetchone()
        
        if not miembro:
            print(f"❌ [TEST] El usuario {usuario_id} no es miembro del grupo {grupo_id}")
            cursor.close()
            conn.close()
            return jsonify({'error': 'Miembro no encontrado'}), 404
        
        print(f"📋 [TEST] Rol actual del miembro: {miembro[0]}")
        
        # Cambiar rol
        sql = "UPDATE miembros_grupo SET rol = %s WHERE grupo_id = %s AND usuario_id = %s"
        cursor.execute(sql, (nuevo_rol, grupo_id, usuario_id))
        
        # Verificar que se actualizó correctamente
        filas_afectadas = cursor.rowcount
        print(f"📋 [TEST] Filas afectadas por el UPDATE: {filas_afectadas}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [TEST] Rol cambiado exitosamente")
        return jsonify({'mensaje': 'Rol cambiado exitosamente', 'filas_afectadas': filas_afectadas})
        
    except Exception as e:
        print(f"❌ [TEST] Error en test_cambiar_rol: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/grupos/<int:grupo_id>/miembros-detallados', methods=['GET'])
def listar_miembros_detallados(grupo_id):
    """Nuevo endpoint para obtener información completa de todos los miembros del grupo"""
    try:
        print(f"🔍 [DEBUG] listar_miembros_detallados llamado con grupo_id: {grupo_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query simple que sabemos que funciona
        sql = """
            SELECT mg.usuario_id, mg.rol, mg.fecha_union,
                   u.nombre, u.apellido, u.correo
            FROM miembros_grupo mg
            INNER JOIN usuarios u ON mg.usuario_id = u.id
            WHERE mg.grupo_id = %s
            ORDER BY mg.rol DESC, u.nombre ASC
        """
        
        cursor.execute(sql, (grupo_id,))
        miembros = cursor.fetchall()
        
        print(f"📦 [DEBUG] Miembros encontrados: {len(miembros)}")
        
        # Convertir fechas a string de forma más segura
        for miembro in miembros:
            if miembro['fecha_union']:
                try:
                    if isinstance(miembro['fecha_union'], datetime):
                        miembro['fecha_union'] = miembro['fecha_union'].strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        miembro['fecha_union'] = str(miembro['fecha_union'])
                except Exception as date_error:
                    print(f"⚠️ [WARNING] Error al convertir fecha: {date_error}")
                    miembro['fecha_union'] = str(miembro['fecha_union'])
        
        cursor.close()
        conn.close()
        
        print(f"✅ [DEBUG] Retornando {len(miembros)} miembros")
        return jsonify(miembros)
        
    except Exception as e:
        print(f"❌ [ERROR] Error en listar_miembros_detallados: {e}")
        import traceback
        print(f"📋 [DEBUG] Traceback completo:")
        traceback.print_exc()
        return jsonify({'error': 'Error al obtener miembros del grupo'}), 500

def aceptar_invitacion_grupo(invitacion_id, usuario_id):
    """Aceptar una invitación a un grupo"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener información de la invitación
        cursor.execute("SELECT grupo_id, rol FROM invitaciones_grupo WHERE id = %s AND usuario_id = %s AND estado = 'pendiente'", (invitacion_id, usuario_id))
        invitacion = cursor.fetchone()
        
        if not invitacion:
            print(f"❌ [ERROR] Invitación no encontrada o ya procesada")
            return False
        
        grupo_id, rol = invitacion
        
        # Verificar si ya es miembro
        if verificar_miembro_grupo(grupo_id, usuario_id):
            print(f"⚠️ [WARN] Usuario {usuario_id} ya es miembro del grupo {grupo_id}")
            # Marcar invitación como aceptada aunque ya sea miembro
            cursor.execute("UPDATE invitaciones_grupo SET estado = 'aceptada', fecha_respuesta = NOW() WHERE id = %s", (invitacion_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return True
        
        # Agregar como miembro
        sql = "INSERT INTO miembros_grupo (grupo_id, usuario_id, rol) VALUES (%s, %s, %s)"
        cursor.execute(sql, (grupo_id, usuario_id, rol))
        
        # Marcar invitación como aceptada
        cursor.execute("UPDATE invitaciones_grupo SET estado = 'aceptada', fecha_respuesta = NOW() WHERE id = %s", (invitacion_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Usuario {usuario_id} aceptó invitación al grupo {grupo_id} como {rol}")
        
        # Crear notificación de aceptación
        notificar_aceptacion_invitacion(grupo_id, usuario_id, rol)
        
        return True
    except Exception as e:
        print(f"❌ [ERROR] Error al aceptar invitación: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def rechazar_invitacion_grupo(invitacion_id, usuario_id):
    """Rechazar una invitación a un grupo"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar que la invitación existe y es del usuario
        cursor.execute("SELECT grupo_id, rol FROM invitaciones_grupo WHERE id = %s AND usuario_id = %s AND estado = 'pendiente'", (invitacion_id, usuario_id))
        invitacion = cursor.fetchone()
        
        if not invitacion:
            print(f"❌ [ERROR] Invitación no encontrada o ya procesada")
            return False
        
        grupo_id, rol = invitacion
        
        # Marcar invitación como rechazada
        cursor.execute("UPDATE invitaciones_grupo SET estado = 'rechazada', fecha_respuesta = NOW() WHERE id = %s", (invitacion_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Usuario {usuario_id} rechazó invitación al grupo {grupo_id}")
        
        # Crear notificación de rechazo
        notificar_rechazo_invitacion(grupo_id, usuario_id)
        
        return True
    except Exception as e:
        print(f"❌ [ERROR] Error al rechazar invitación: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def obtener_invitaciones_pendientes_usuario(usuario_id):
    """Obtener todas las invitaciones pendientes de un usuario"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = """
        SELECT i.*, g.nombre as grupo_nombre, g.descripcion as grupo_descripcion,
               u.nombre as creador_nombre, u.apellido as creador_apellido
        FROM invitaciones_grupo i
        JOIN grupos g ON i.grupo_id = g.id
        JOIN usuarios u ON g.creador_id = u.id
        WHERE i.usuario_id = %s 
        AND i.estado = 'pendiente'
        AND NOT EXISTS (
            SELECT 1 FROM miembros_grupo mg 
            WHERE mg.grupo_id = i.grupo_id 
            AND mg.usuario_id = i.usuario_id
        )
        ORDER BY i.fecha_invitacion DESC
        """
        
        cursor.execute(sql, (usuario_id,))
        invitaciones = cursor.fetchall()
        
        # Agregar propiedades necesarias para el frontend
        for invitacion in invitaciones:
            invitacion['es_invitacion'] = True
            invitacion['invitacion_id'] = invitacion['id']
            invitacion['nombre'] = invitacion['grupo_nombre']
            invitacion['descripcion'] = invitacion['grupo_descripcion']
            invitacion['total_miembros'] = 0  # Se puede calcular si es necesario
            invitacion['total_tareas'] = 0     # Se puede calcular si es necesario
        
        cursor.close()
        conn.close()
        
        return invitaciones
    except Exception as e:
        print(f"❌ [ERROR] Error al obtener invitaciones pendientes: {e}")
        return []

def notificar_aceptacion_invitacion(grupo_id, usuario_id, rol):
    """Crear notificación cuando se acepta una invitación"""
    try:
        # Obtener información del grupo
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT nombre FROM grupos WHERE id = %s", (grupo_id,))
        grupo = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not grupo:
            return False
        
        titulo = f"Invitación aceptada"
        mensaje = f"Has aceptado la invitación al grupo '{grupo['nombre']}' como {rol}."
        datos = {
            'grupo_id': grupo_id,
            'grupo_nombre': grupo['nombre'],
            'rol': rol,
            'tipo': 'grupo_invitacion_aceptada'
        }
        
        return crear_notificacion(usuario_id, 'grupo_invitacion_aceptada', titulo, mensaje, datos)
    except Exception as e:
        print(f"❌ [ERROR] Error al crear notificación de aceptación: {e}")
        return None

def notificar_rechazo_invitacion(grupo_id, usuario_id):
    """Crear notificación cuando se rechaza una invitación"""
    try:
        # Obtener información del grupo
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT nombre FROM grupos WHERE id = %s", (grupo_id,))
        grupo = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not grupo:
            return False
        
        titulo = f"Invitación rechazada"
        mensaje = f"Has rechazado la invitación al grupo '{grupo['nombre']}'."
        datos = {
            'grupo_id': grupo_id,
            'grupo_nombre': grupo['nombre'],
            'tipo': 'grupo_invitacion_rechazada'
        }
        
        return crear_notificacion(usuario_id, 'grupo_invitacion_rechazada', titulo, mensaje, datos)
    except Exception as e:
        print(f"❌ [ERROR] Error al crear notificación de rechazo: {e}")
        return None

@app.route('/invitaciones/<int:invitacion_id>/aceptar', methods=['PUT'])
def aceptar_invitacion_endpoint(invitacion_id):
    """Aceptar una invitación a un grupo"""
    try:
        data = request.json
        usuario_id = data.get('usuario_id')
        
        if not usuario_id:
            return jsonify({'error': 'Usuario ID requerido'}), 400
        
        success = aceptar_invitacion_grupo(invitacion_id, usuario_id)
        
        if success:
            return jsonify({'mensaje': 'Invitación aceptada exitosamente'})
        else:
            return jsonify({'error': 'Error al aceptar invitación'}), 400
            
    except Exception as e:
        print(f"❌ [ERROR] Error en aceptar_invitacion_endpoint: {e}")
        return jsonify({'error': 'Error al aceptar invitación'}), 500

@app.route('/invitaciones/<int:invitacion_id>/rechazar', methods=['PUT'])
def rechazar_invitacion_endpoint(invitacion_id):
    """Rechazar una invitación a un grupo"""
    try:
        data = request.json
        usuario_id = data.get('usuario_id')
        
        if not usuario_id:
            return jsonify({'error': 'Usuario ID requerido'}), 400
        
        success = rechazar_invitacion_grupo(invitacion_id, usuario_id)
        
        if success:
            return jsonify({'mensaje': 'Invitación rechazada exitosamente'})
        else:
            return jsonify({'error': 'Error al rechazar invitación'}), 400
            
    except Exception as e:
        print(f"❌ [ERROR] Error en rechazar_invitacion_endpoint: {e}")
        return jsonify({'error': 'Error al rechazar invitación'}), 500

@app.route('/invitaciones/<int:invitacion_id>/archivar', methods=['PUT'])
def archivar_invitacion_endpoint(invitacion_id):
    """Archivar una invitación (cambiar estado a 'archivada')"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar que la invitación existe y está pendiente
        cursor.execute("SELECT * FROM invitaciones_grupo WHERE id = %s AND estado = 'pendiente'", (invitacion_id,))
        invitacion = cursor.fetchone()
        
        if not invitacion:
            return jsonify({'error': 'Invitación no encontrada o ya procesada'}), 404
        
        # Cambiar estado a 'archivada'
        cursor.execute("UPDATE invitaciones_grupo SET estado = 'archivada' WHERE id = %s", (invitacion_id,))
        conn.commit()
        
        # Crear notificación para el usuario
        notificar_invitacion_archivada(invitacion_id)
        
        cursor.close()
        conn.close()
        
        return jsonify({'mensaje': 'Invitación archivada exitosamente'})
        
    except Exception as e:
        print(f"❌ [ERROR] Error al archivar invitación: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return jsonify({'error': 'Error al archivar invitación'}), 500

def notificar_invitacion_archivada(invitacion_id):
    """Crear notificación cuando se archiva una invitación"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener información de la invitación
        cursor.execute("""
            SELECT i.usuario_id, g.nombre as grupo_nombre, g.creador_id
            FROM invitaciones_grupo i
            JOIN grupos g ON i.grupo_id = g.id
            WHERE i.id = %s
        """, (invitacion_id,))
        
        invitacion = cursor.fetchone()
        if invitacion:
            usuario_id = invitacion[0]
            grupo_nombre = invitacion[1]
            
            # Crear notificación
            mensaje = f"Invitación al grupo '{grupo_nombre}' archivada para revisar más tarde"
            cursor.execute("""
                INSERT INTO notificaciones (usuario_id, tipo, mensaje, leida, fecha_creacion)
                VALUES (%s, 'invitacion_archivada', %s, FALSE, NOW())
            """, (usuario_id, mensaje))
            
            conn.commit()
            print(f"✅ [SUCCESS] Notificación creada para usuario {usuario_id}: Invitación archivada")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ [ERROR] Error al crear notificación de invitación archivada: {e}")

def limpiar_invitaciones_duplicadas():
    """Limpiar invitaciones de usuarios que ya son miembros del grupo"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Eliminar invitaciones pendientes de usuarios que ya son miembros
        sql = """
        DELETE i FROM invitaciones_grupo i
        INNER JOIN miembros_grupo mg ON i.grupo_id = mg.grupo_id AND i.usuario_id = mg.usuario_id
        WHERE i.estado = 'pendiente'
        """
        
        cursor.execute(sql)
        eliminadas = cursor.rowcount
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ [SUCCESS] Eliminadas {eliminadas} invitaciones duplicadas")
        return eliminadas
        
    except Exception as e:
        print(f"❌ [ERROR] Error al limpiar invitaciones duplicadas: {e}")
        return 0

@app.route('/admin/limpiar-invitaciones-duplicadas', methods=['POST'])
def limpiar_invitaciones_duplicadas_endpoint():
    """Endpoint para limpiar invitaciones duplicadas"""
    try:
        eliminadas = limpiar_invitaciones_duplicadas()
        return jsonify({
            'mensaje': f'Se eliminaron {eliminadas} invitaciones duplicadas',
            'eliminadas': eliminadas
        })
    except Exception as e:
        return jsonify({'error': f'Error al limpiar invitaciones: {e}'}), 500



if __name__ == '__main__':
    app.run(debug=True, port=8000, host='0.0.0.0') 