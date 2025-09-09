#!/usr/bin/env python3
"""
Servidor Flask simple para probar la conexión
"""
from flask import Flask, jsonify
import os
from dotenv import load_dotenv

# Cargar configuración
if os.path.exists('env.local'):
    load_dotenv('env.local')
    print("✅ Cargando configuración desde env.local")
elif os.path.exists('env.production'):
    load_dotenv('env.production')
    print("✅ Cargando configuración desde env.production")
else:
    load_dotenv()
    print("✅ Cargando configuración desde .env")

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        'message': 'Servidor Astren funcionando correctamente',
        'status': 'ok',
        'database_host': os.getenv('MYSQL_HOST'),
        'database_port': os.getenv('MYSQL_PORT')
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

@app.route('/test-db')
def test_db():
    try:
        import mysql.connector
        from mysql.connector import Error
        
        host = os.getenv('MYSQL_HOST')
        port = int(os.getenv('MYSQL_PORT', 3306))
        user = os.getenv('MYSQL_USER')
        password = os.getenv('MYSQL_PASSWORD')
        database = os.getenv('MYSQL_DATABASE')
        
        connection = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            ssl_disabled=False,
            ssl_verify_cert=False,
            ssl_verify_identity=False,
            connection_timeout=10
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM usuarios")
            count = cursor.fetchone()
            cursor.close()
            connection.close()
            
            return jsonify({
                'status': 'success',
                'message': 'Conexión a base de datos exitosa',
                'usuarios_count': count[0]
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'No se pudo conectar a la base de datos'
            })
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error de conexión: {str(e)}'
        })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"🚀 Iniciando servidor simple en puerto {port}")
    print(f"🌐 URL: http://localhost:{port}")
    print(f"🔍 Health check: http://localhost:{port}/health")
    print(f"🗄️ Test DB: http://localhost:{port}/test-db")
    print("🛑 Presiona Ctrl+C para detener")
    
    app.run(host='0.0.0.0', port=port, debug=True)

