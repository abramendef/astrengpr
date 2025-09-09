#!/usr/bin/env python3
"""
Script para iniciar el servidor Flask con diagnóstico completo
"""
import os
import sys
from dotenv import load_dotenv

def main():
    print("🚀 Iniciando servidor Astren...")
    print("=" * 50)
    
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
    
    # Mostrar configuración
    port = int(os.getenv('PORT', 5000))
    env = os.getenv('FLASK_ENV', 'development')
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"🔧 Configuración del servidor:")
    print(f"   Puerto: {port}")
    print(f"   Entorno: {env}")
    print(f"   Debug: {debug}")
    print(f"   Host: 0.0.0.0 (todas las interfaces)")
    
    # Verificar conexión a base de datos
    print(f"\n🔄 Verificando conexión a base de datos...")
    try:
        import mysql.connector
        from mysql.connector import Error
        
        host = os.getenv('MYSQL_HOST')
        port_db = int(os.getenv('MYSQL_PORT', 3306))
        user = os.getenv('MYSQL_USER')
        password = os.getenv('MYSQL_PASSWORD')
        database = os.getenv('MYSQL_DATABASE')
        
        connection = mysql.connector.connect(
            host=host,
            port=port_db,
            user=user,
            password=password,
            database=database,
            ssl_disabled=False,
            ssl_verify_cert=False,
            ssl_verify_identity=False,
            connection_timeout=10
        )
        
        if connection.is_connected():
            print("✅ Conexión a base de datos exitosa")
            connection.close()
        else:
            print("❌ No se pudo conectar a la base de datos")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión a base de datos: {e}")
        return False
    
    # Importar y configurar la aplicación
    print(f"\n🔄 Importando aplicación Flask...")
    try:
        from app import app
        print("✅ Aplicación Flask importada correctamente")
    except Exception as e:
        print(f"❌ Error al importar aplicación: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Iniciar servidor
    print(f"\n🌐 Iniciando servidor en http://0.0.0.0:{port}")
    print("   Presiona Ctrl+C para detener el servidor")
    print("=" * 50)
    
    try:
        app.run(
            host='0.0.0.0',
            port=port,
            debug=debug,
            use_reloader=False,  # Evitar problemas de recarga
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error al iniciar servidor: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n💥 Error al iniciar el servidor")
        sys.exit(1)
    else:
        print("\n✅ Servidor detenido correctamente")

