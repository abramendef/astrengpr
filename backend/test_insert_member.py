#!/usr/bin/env python3
"""
Script para probar específicamente el INSERT a miembros_grupo
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import get_db_connection

def test_insert_member():
    """Probar el INSERT a miembros_grupo"""
    print("🧪 [TEST] Probando INSERT a miembros_grupo...")
    
    # Simular los datos de una invitación aceptada
    grupo_id = 12
    usuario_id = 3
    rol = 'miembro'
    
    print(f"🔍 [TEST] Datos de prueba:")
    print(f"  - Grupo ID: {grupo_id}")
    print(f"  - Usuario ID: {usuario_id}")
    print(f"  - Rol: {rol}")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar si ya existe
        cursor.execute("SELECT * FROM miembros_grupo WHERE grupo_id = %s AND usuario_id = %s", (grupo_id, usuario_id))
        existe = cursor.fetchone()
        print(f"🔍 [TEST] ¿Ya existe?: {existe is not None}")
        
        if not existe:
            # Intentar el INSERT
            sql = "INSERT INTO miembros_grupo (grupo_id, usuario_id, rol) VALUES (%s, %s, %s)"
            print(f"🔍 [TEST] Ejecutando SQL: {sql}")
            print(f"🔍 [TEST] Parámetros: grupo_id={grupo_id}, usuario_id={usuario_id}, rol={rol}")
            
            cursor.execute(sql, (grupo_id, usuario_id, rol))
            print(f"✅ [TEST] INSERT ejecutado exitosamente")
            
            # Verificar que se insertó
            cursor.execute("SELECT * FROM miembros_grupo WHERE grupo_id = %s AND usuario_id = %s", (grupo_id, usuario_id))
            resultado = cursor.fetchone()
            print(f"🔍 [TEST] ¿Se insertó correctamente?: {resultado is not None}")
            
            conn.commit()
            print(f"✅ [TEST] Commit realizado exitosamente")
        else:
            print(f"⚠️ [TEST] Ya existe, no se inserta")
        
        cursor.close()
        conn.close()
        print(f"✅ [TEST] Conexión cerrada correctamente")
        
    except Exception as e:
        print(f"❌ [TEST] Error: {e}")
        import traceback
        traceback.print_exc()
        
        if 'conn' in locals():
            try:
                conn.rollback()
                conn.close()
                print(f"✅ [TEST] Rollback y cierre de conexión realizado")
            except:
                pass

if __name__ == "__main__":
    test_insert_member() 