#!/usr/bin/env python3
"""
Script para verificar la estructura de la base de datos de Aiven
"""

import os
import mysql.connector
from dotenv import load_dotenv

def check_database_structure():
    """Verificar la estructura de la base de datos"""
    
    # Cargar variables de entorno desde env.production
    backend_dir = os.path.dirname(os.path.dirname(__file__))
    env_path = os.path.join(backend_dir, 'backend', 'env.production')
    if os.path.exists(env_path):
        load_dotenv(env_path)
        print(f"✅ Archivo env.production cargado desde: {env_path}")
    else:
        print(f"⚠️ No se encontró env.production en: {env_path}")
        load_dotenv()
    
    try:
        # Conectar a la base de datos
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE'),
            port=int(os.getenv('MYSQL_PORT'))
        )
        
        cursor = conn.cursor()
        
        print("🔍 VERIFICANDO ESTRUCTURA DE BASE DE DATOS - AIVEN")
        print("=" * 60)
        
        # 1. Verificar tablas existentes
        print("\n📊 1. TABLAS EXISTENTES:")
        print("-" * 40)
        
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        if tables:
            for table in tables:
                table_name = table[0]
                print(f"   ✅ {table_name}")
                
                # Verificar estructura de cada tabla
                cursor.execute(f"DESCRIBE {table_name}")
                columns = cursor.fetchall()
                print(f"      📋 Columnas: {len(columns)}")
                
                for col in columns:
                    col_name, col_type, nullable, key, default, extra = col
                    print(f"         - {col_name}: {col_type} {'(NULL)' if nullable == 'YES' else '(NOT NULL)'}")
                
                print()
        else:
            print("   ❌ No se encontraron tablas")
        
        # 2. Verificar base de datos
        print("\n📊 2. INFORMACIÓN DE LA BASE DE DATOS:")
        print("-" * 40)
        
        cursor.execute("SELECT DATABASE()")
        current_db = cursor.fetchone()[0]
        print(f"   🗄️ Base de datos actual: {current_db}")
        
        # 3. Verificar usuario y permisos
        print("\n📊 3. INFORMACIÓN DEL USUARIO:")
        print("-" * 40)
        
        cursor.execute("SELECT USER(), CURRENT_USER()")
        user_info = cursor.fetchone()
        print(f"   👤 Usuario conectado: {user_info[0]}")
        print(f"   🔑 Usuario autenticado: {user_info[1]}")
        
        # 4. Verificar versión de MySQL
        print("\n📊 4. VERSIÓN DE MYSQL:")
        print("-" * 40)
        
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()[0]
        print(f"   🐬 Versión: {version}")
        
        # 5. Verificar tablas esperadas vs existentes
        print("\n📊 5. ANÁLISIS DE TABLAS ESPERADAS:")
        print("-" * 40)
        
        expected_tables = [
            'usuarios', 'tareas', 'areas', 'grupos', 
            'miembros_grupo', 'notificaciones', 'reputacion_general'
        ]
        
        existing_table_names = [table[0] for table in tables]
        
        for expected_table in expected_tables:
            if expected_table in existing_table_names:
                print(f"   ✅ {expected_table}: EXISTE")
            else:
                print(f"   ❌ {expected_table}: FALTANTE")
        
        # 6. Recomendaciones
        print("\n📊 6. RECOMENDACIONES:")
        print("-" * 40)
        
        missing_tables = [table for table in expected_tables if table not in existing_table_names]
        
        if missing_tables:
            print(f"   🔧 Tablas faltantes: {', '.join(missing_tables)}")
            print(f"   💡 Necesitas crear estas tablas antes de usar la aplicación")
            print(f"   💡 Usa el script create_database.sql o ejecuta las consultas manualmente")
        else:
            print(f"   🎉 Todas las tablas esperadas están presentes")
        
        cursor.close()
        conn.close()
        
        print("\n" + "=" * 60)
        print("🎯 RESUMEN")
        print("=" * 60)
        
        if missing_tables:
            print("❌ PROBLEMA: Faltan tablas en la base de datos")
            print("💡 SOLUCIÓN: Crear las tablas faltantes")
        else:
            print("✅ ESTADO: Base de datos completa")
            print("🚀 Puedes usar la aplicación normalmente")
        
        return True
        
    except mysql.connector.Error as err:
        print(f"❌ Error de MySQL: {err}")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def main():
    """Función principal"""
    try:
        success = check_database_structure()
        if success:
            print("\n🎉 Verificación completada")
        else:
            print("\n❌ La verificación falló")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
