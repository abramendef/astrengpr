#!/usr/bin/env python3
"""
Script de prueba para simular el proceso de aceptar invitación
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import aceptar_invitacion_grupo, get_db_connection

def test_accept_invitation():
    """Probar el proceso de aceptar invitación"""
    print("🧪 [TEST] Iniciando prueba de aceptar invitación...")
    
    # Simular aceptar invitación del usuario 2 al grupo 13
    invitacion_id = 45  # La invitación que acabamos de ver
    usuario_id = 2
    grupo_id = 13
    
    print(f"🔍 [TEST] Datos de prueba:")
    print(f"  - Invitación ID: {invitacion_id}")
    print(f"  - Usuario ID: {usuario_id}")
    print(f"  - Grupo ID: {grupo_id}")
    
    # Verificar estado inicial
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verificar si ya es miembro
    cursor.execute("SELECT * FROM miembros_grupo WHERE usuario_id = %s AND grupo_id = %s", (usuario_id, grupo_id))
    miembro = cursor.fetchone()
    print(f"🔍 [TEST] ¿Ya es miembro?: {miembro is not None}")
    
    # Verificar estado de la invitación
    cursor.execute("SELECT * FROM invitaciones_grupo WHERE id = %s", (invitacion_id,))
    invitacion = cursor.fetchone()
    print(f"🔍 [TEST] Estado de invitación: {invitacion}")
    
    cursor.close()
    conn.close()
    
    # Probar aceptar invitación
    print(f"🧪 [TEST] Ejecutando aceptar_invitacion_grupo...")
    try:
        resultado = aceptar_invitacion_grupo(invitacion_id, usuario_id)
        print(f"✅ [TEST] Resultado: {resultado}")
    except Exception as e:
        print(f"❌ [TEST] Error: {e}")
        import traceback
        traceback.print_exc()
    
    # Verificar estado final
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM miembros_grupo WHERE usuario_id = %s AND grupo_id = %s", (usuario_id, grupo_id))
    miembro_final = cursor.fetchone()
    print(f"🔍 [TEST] ¿Es miembro después?: {miembro_final is not None}")
    
    cursor.execute("SELECT * FROM invitaciones_grupo WHERE id = %s", (invitacion_id,))
    invitacion_final = cursor.fetchone()
    print(f"🔍 [TEST] Estado final de invitación: {invitacion_final}")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    test_accept_invitation() 