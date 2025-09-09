#!/usr/bin/env python3
"""
Script de diagnóstico completo para el servidor Astren
"""
import os
import sys
import socket
import subprocess
from dotenv import load_dotenv

def check_python_environment():
    """Verificar el entorno de Python"""
    print("🐍 Verificando entorno de Python...")
    print(f"   Python version: {sys.version}")
    print(f"   Python executable: {sys.executable}")
    print(f"   Working directory: {os.getcwd()}")
    
    # Verificar dependencias
    required_packages = ['flask', 'mysql-connector-python', 'python-dotenv']
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"   ✅ {package}: Disponible")
        except ImportError:
            print(f"   ❌ {package}: NO DISPONIBLE")

def check_configuration():
    """Verificar configuración"""
    print("\n🔧 Verificando configuración...")
    
    # Cargar configuración
    if os.path.exists('env.local'):
        load_dotenv('env.local')
        print("   ✅ Cargando desde env.local")
    elif os.path.exists('env.production'):
        load_dotenv('env.production')
        print("   ✅ Cargando desde env.production")
    else:
        load_dotenv()
        print("   ✅ Cargando desde .env")
    
    # Mostrar configuración
    config_vars = [
        'MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_USER', 
        'MYSQL_PASSWORD', 'MYSQL_DATABASE', 'PORT'
    ]
    
    for var in config_vars:
        value = os.getenv(var)
        if value:
            if 'PASSWORD' in var:
                print(f"   {var}: {'*' * len(value)}")
            else:
                print(f"   {var}: {value}")
        else:
            print(f"   ❌ {var}: NO DEFINIDO")

def check_database_connection():
    """Verificar conexión a base de datos"""
    print("\n🗄️ Verificando conexión a base de datos...")
    
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
            print("   ✅ Conexión exitosa")
            cursor = connection.cursor()
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"   MySQL version: {version[0]}")
            cursor.close()
            connection.close()
            return True
        else:
            print("   ❌ No se pudo conectar")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def check_port_availability(port):
    """Verificar si un puerto está disponible"""
    print(f"\n🔌 Verificando puerto {port}...")
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        
        if result == 0:
            print(f"   ❌ Puerto {port}: OCUPADO")
            return False
        else:
            print(f"   ✅ Puerto {port}: DISPONIBLE")
            return True
    except Exception as e:
        print(f"   ❌ Error verificando puerto: {e}")
        return False

def test_app_import():
    """Probar importación de la aplicación"""
    print("\n📦 Verificando importación de la aplicación...")
    
    try:
        from app import app
        print("   ✅ Aplicación importada correctamente")
        print(f"   App name: {app.name}")
        print(f"   Debug mode: {app.debug}")
        return True
    except Exception as e:
        print(f"   ❌ Error al importar aplicación: {e}")
        import traceback
        traceback.print_exc()
        return False

def start_server_test():
    """Probar inicio del servidor"""
    print("\n🚀 Probando inicio del servidor...")
    
    port = int(os.getenv('PORT', 5000))
    
    if not check_port_availability(port):
        print(f"   ❌ Puerto {port} no está disponible")
        return False
    
    try:
        from app import app
        print(f"   ✅ Iniciando servidor en puerto {port}...")
        print(f"   🌐 URL: http://localhost:{port}")
        print("   🛑 Presiona Ctrl+C para detener")
        
        app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)
        return True
        
    except Exception as e:
        print(f"   ❌ Error al iniciar servidor: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("🔍 DIAGNÓSTICO COMPLETO DEL SERVIDOR ASTREN")
    print("=" * 60)
    
    # Verificaciones
    check_python_environment()
    check_configuration()
    db_ok = check_database_connection()
    
    if not db_ok:
        print("\n❌ No se puede continuar sin conexión a base de datos")
        return False
    
    app_ok = test_app_import()
    if not app_ok:
        print("\n❌ No se puede continuar sin aplicación Flask")
        return False
    
    # Verificar puertos
    port = int(os.getenv('PORT', 5000))
    port_ok = check_port_availability(port)
    
    if not port_ok:
        print(f"\n❌ Puerto {port} no está disponible")
        return False
    
    print("\n✅ Todas las verificaciones pasaron")
    print("🚀 Iniciando servidor...")
    
    # Iniciar servidor
    return start_server_test()

if __name__ == "__main__":
    try:
        success = main()
        if not success:
            print("\n💥 Diagnóstico falló")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

