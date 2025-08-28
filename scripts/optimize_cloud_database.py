#!/usr/bin/env python3
"""
Script para optimizar la base de datos de Astren en la nube
Aplica índices y configuraciones para mejorar el rendimiento
"""

import mysql.connector
import os
from dotenv import load_dotenv
import logging
import sys

# Cargar variables de entorno
# Buscar env.production en la carpeta backend (un nivel arriba de scripts)
import os
from pathlib import Path

# Obtener la ruta del directorio backend (un nivel arriba de scripts)
backend_dir = Path(__file__).parent.parent / 'backend'
env_path = backend_dir / 'env.production'

if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Archivo env.production cargado desde: {env_path}")
else:
    print(f"⚠️ No se encontró env.production en: {env_path}")
    # Intentar cargar desde el directorio actual
    load_dotenv()

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def get_db_connection():
    """Obtener conexión a la base de datos de la nube"""
    try:
        # Priorizar variables de entorno de producción
        host = os.getenv('MYSQL_HOST') or os.getenv('DB_HOST')
        user = os.getenv('MYSQL_USER') or os.getenv('DB_USER')
        password = os.getenv('MYSQL_PASSWORD') or os.getenv('DB_PASSWORD')
        database = os.getenv('MYSQL_DATABASE') or os.getenv('DB_NAME')
        port = int(os.getenv('MYSQL_PORT') or os.getenv('DB_PORT', '3306'))
        
        if not all([host, user, password, database]):
            raise ValueError("Faltan variables de entorno para la conexión a la base de datos")
        
        logger.info(f"🔗 Conectando a: {host}:{port}/{database}")
        
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port,
            autocommit=True,
            charset='utf8mb4'
        )
        return conn
    except mysql.connector.Error as err:
        logger.error(f"❌ Error de conexión a la base de datos: {err}")
        raise
    except ValueError as err:
        logger.error(f"❌ Error de configuración: {err}")
        raise

def check_table_exists(conn, table_name):
    """Verificar si una tabla existe"""
    cursor = conn.cursor()
    try:
        cursor.execute("SHOW TABLES LIKE %s", (table_name,))
        exists = cursor.fetchone() is not None
        return exists
    except mysql.connector.Error as err:
        logger.warning(f"⚠️ Error al verificar tabla {table_name}: {err}")
        return False
    finally:
        cursor.close()

def create_indexes(conn):
    """Crear índices para optimizar el rendimiento"""
    # Definir índices por tabla
    indexes_by_table = {
        'tareas': [
            "CREATE INDEX idx_tareas_usuario_id ON tareas(usuario_id)",
            "CREATE INDEX idx_tareas_asignado_a_id ON tareas(asignado_a_id)",
            "CREATE INDEX idx_tareas_estado ON tareas(estado)",
            "CREATE INDEX idx_tareas_fecha_vencimiento ON tareas(fecha_vencimiento)",
            "CREATE INDEX idx_tareas_fecha_creacion ON tareas(fecha_creacion)",
            "CREATE INDEX idx_tareas_area_id ON tareas(area_id)",
            "CREATE INDEX idx_tareas_grupo_id ON tareas(grupo_id)",
            "CREATE INDEX idx_tareas_dashboard ON tareas(usuario_id, estado, fecha_creacion)"
        ],
        'areas': [
            "CREATE INDEX idx_areas_usuario_id ON areas(usuario_id)",
            "CREATE INDEX idx_areas_estado ON areas(estado)"
        ],
        'grupos': [
            "CREATE INDEX idx_grupos_estado ON grupos(estado)"
        ],
        'miembros_grupo': [
            "CREATE INDEX idx_miembros_grupo_grupo_id ON miembros_grupo(grupo_id)",
            "CREATE INDEX idx_miembros_grupo_usuario_id ON miembros_grupo(usuario_id)",
            "CREATE INDEX idx_miembros_grupo_compuesto ON miembros_grupo(grupo_id, usuario_id)"
        ],
        'usuarios': [
            "CREATE INDEX idx_usuarios_correo ON usuarios(correo)"
        ]
    }
    
    cursor = conn.cursor()
    created_count = 0
    total_processed = 0
    
    for table_name, indexes in indexes_by_table.items():
        if not check_table_exists(conn, table_name):
            logger.warning(f"⚠️ Tabla {table_name} no existe, saltando índices")
            continue
            
        logger.info(f"🔧 Procesando índices para tabla: {table_name}")
        
        for index_sql in indexes:
            try:
                cursor.execute(index_sql)
                created_count += 1
                logger.info(f"   ✅ Índice creado")
                total_processed += 1
            except mysql.connector.Error as err:
                if "Duplicate key name" in str(err) or "already exists" in str(err):
                    logger.info(f"   ℹ️ Índice ya existe")
                else:
                    logger.warning(f"   ⚠️ No se pudo crear índice: {err}")
                total_processed += 1
    
    cursor.close()
    return created_count, total_processed

def analyze_tables(conn):
    """Analizar tablas para optimizar estadísticas"""
    tables = ['tareas', 'areas', 'grupos', 'miembros_grupo', 'usuarios']
    cursor = conn.cursor()
    analyzed_count = 0
    
    for table_name in tables:
        if not check_table_exists(conn, table_name):
            logger.warning(f"⚠️ Tabla {table_name} no existe, saltando análisis")
            continue
            
        try:
            cursor.execute(f"ANALYZE TABLE {table_name}")
            # Consumir el resultado para evitar "Unread result found"
            result = cursor.fetchall()
            analyzed_count += 1
            logger.info(f"✅ Tabla analizada: {table_name}")
        except mysql.connector.Error as err:
            logger.warning(f"⚠️ No se pudo analizar tabla {table_name}: {err}")
    
    cursor.close()
    return analyzed_count

def show_table_info(conn):
    """Mostrar información básica de las tablas"""
    cursor = conn.cursor()
    
    try:
        # Mostrar tablas disponibles
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        logger.info("📋 Tablas disponibles:")
        for table in tables:
            table_name = table[0]
            logger.info(f"   📊 {table_name}")
            
            # Mostrar estructura básica
            try:
                cursor.execute(f"DESCRIBE {table_name}")
                columns = cursor.fetchall()
                logger.info(f"      Columnas: {len(columns)}")
                
                # Mostrar índices si existen
                try:
                    cursor.execute(f"SHOW INDEX FROM {table_name}")
                    indexes = cursor.fetchall()
                    if indexes:
                        logger.info(f"      Índices: {len(indexes)}")
                    else:
                        logger.info(f"      Índices: 0 (¡Necesita optimización!)")
                except:
                    logger.info(f"      Índices: No disponible")
                    
            except mysql.connector.Error as err:
                logger.warning(f"      ⚠️ Error al describir tabla: {err}")
                
    except mysql.connector.Error as err:
        logger.error(f"❌ Error al obtener información de tablas: {err}")
    
    cursor.close()

def optimize_database():
    """Función principal para optimizar la base de datos"""
    try:
        logger.info("🚀 Iniciando optimización de la base de datos de la nube...")
        
        # Conectar a la base de datos
        conn = get_db_connection()
        logger.info("✅ Conexión establecida exitosamente")
        
        # Mostrar información actual
        logger.info("📊 Información actual de la base de datos:")
        show_table_info(conn)
        
        # Crear índices
        logger.info("🔧 Creando índices de optimización...")
        created_count, total_processed = create_indexes(conn)
        logger.info(f"✅ {created_count} índices creados de {total_processed} procesados")
        
        # Analizar tablas
        logger.info("📊 Analizando tablas para optimizar estadísticas...")
        analyzed_count = analyze_tables(conn)
        logger.info(f"✅ {analyzed_count} tablas analizadas")
        
        # Mostrar información después de la optimización
        logger.info("📊 Información después de la optimización:")
        show_table_info(conn)
        
        conn.close()
        logger.info("✅ Optimización completada exitosamente")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error durante la optimización: {e}")
        return False

def main():
    """Función principal del script"""
    print("🚀 Script de Optimización de Base de Datos - Astren Cloud")
    print("=" * 60)
    
    try:
        success = optimize_database()
        
        if success:
            print("\n🎉 ¡Base de datos optimizada exitosamente!")
            print("📈 El rendimiento del dashboard debería mejorar significativamente")
            print("\n💡 Próximos pasos:")
            print("   1. Reinicia tu servidor Flask")
            print("   2. Prueba el dashboard")
            print("   3. Verifica la mejora de rendimiento")
        else:
            print("\n❌ La optimización no se pudo completar")
            print("💡 Revisa los logs de error arriba")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️ Optimización cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
