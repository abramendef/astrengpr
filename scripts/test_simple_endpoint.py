#!/usr/bin/env python3
"""
Script simple para diagnosticar problemas de conexión con Aiven
"""

import requests
import json

def test_basic_endpoints():
    """Probar endpoints básicos para diagnosticar problemas"""
    
    base_url = "http://localhost:8000"
    
    print("🔍 DIAGNÓSTICO DE CONEXIÓN - ASTREN CON AIVEN")
    print("=" * 60)
    
    # Test 1: Endpoint raíz
    print("\n📊 Test 1: Endpoint raíz")
    print("-" * 40)
    
    try:
        response = requests.get(f"{base_url}/")
        print(f"   ✅ Status: {response.status_code}")
        print(f"   📄 Content-Type: {response.headers.get('Content-Type', 'No especificado')}")
        if response.status_code == 200:
            print(f"   📋 Contenido: {response.text[:100]}...")
        else:
            print(f"   ❌ Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
    
    # Test 2: Endpoint de login (si existe)
    print("\n📊 Test 2: Endpoint de login")
    print("-" * 40)
    
    try:
        response = requests.get(f"{base_url}/login")
        print(f"   ✅ Status: {response.status_code}")
        print(f"   📄 Content-Type: {response.headers.get('Content-Type', 'No especificado')}")
        if response.status_code == 200:
            print(f"   📋 Contenido: {response.text[:100]}...")
        else:
            print(f"   ℹ️  Respuesta: {response.text}")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
    
    # Test 3: Endpoint del dashboard con error detallado
    print("\n📊 Test 3: Endpoint del dashboard (con error detallado)")
    print("-" * 40)
    
    try:
        response = requests.get(f"{base_url}/dashboard/1")
        print(f"   ✅ Status: {response.status_code}")
        print(f"   📄 Content-Type: {response.headers.get('Content-Type', 'No especificado')}")
        
        if response.status_code == 200:
            print(f"   🎉 ¡Funciona! Dashboard cargado correctamente")
            data = response.json()
            print(f"   📋 Tareas: {len(data.get('tareas', []))}")
            print(f"   🎯 Áreas: {len(data.get('areas', []))}")
            print(f"   👥 Grupos: {len(data.get('grupos', []))}")
        elif response.status_code == 500:
            print(f"   ❌ Error 500 - Error interno del servidor")
            print(f"   📋 Respuesta completa: {response.text}")
            
            # Intentar parsear como JSON para ver el error
            try:
                error_data = response.json()
                if 'error' in error_data:
                    print(f"   🔍 Error específico: {error_data['error']}")
                if 'message' in error_data:
                    print(f"   🔍 Mensaje: {error_data['message']}")
            except:
                print(f"   🔍 Error no es JSON válido")
                
        else:
            print(f"   ℹ️  Respuesta: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
    
    # Test 4: Verificar conexión a base de datos
    print("\n📊 Test 4: Verificar conexión a base de datos")
    print("-" * 40)
    
    try:
        # Intentar un endpoint que use la base de datos
        response = requests.get(f"{base_url}/dashboard/1")
        
        if response.status_code == 500:
            print(f"   🔍 Analizando error 500...")
            
            # Buscar patrones comunes en el error
            error_text = response.text.lower()
            
            if "connection" in error_text or "mysql" in error_text:
                print(f"   ❌ PROBLEMA: Error de conexión a la base de datos")
                print(f"      💡 Verifica las credenciales de Aiven")
                print(f"      💡 Verifica que Aiven esté accesible")
            elif "syntax" in error_text or "sql" in error_text:
                print(f"   ❌ PROBLEMA: Error de sintaxis SQL")
                print(f"      💡 Verifica la consulta del dashboard")
            elif "table" in error_text or "column" in error_text:
                print(f"   ❌ PROBLEMA: Error de estructura de base de datos")
                print(f"      💡 Verifica que las tablas existan")
            else:
                print(f"   ❌ PROBLEMA: Error desconocido")
                print(f"      💡 Revisa los logs de Flask")
                
        else:
            print(f"   ✅ Conexión a base de datos funcionando")
            
    except Exception as e:
        print(f"   ❌ Error al verificar: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 RESUMEN DEL DIAGNÓSTICO")
    print("=" * 60)
    
    print("💡 PRÓXIMOS PASOS:")
    print("   1. Revisa los logs de Flask para ver el error específico")
    print("   2. Verifica la conexión a Aiven")
    print("   3. Verifica que las tablas existan en la base de datos")
    print("   4. Revisa la consulta SQL del endpoint del dashboard")

def main():
    """Función principal"""
    try:
        test_basic_endpoints()
        print("\n🎉 Diagnóstico completado")
    except Exception as e:
        print(f"\n❌ Error durante el diagnóstico: {e}")

if __name__ == "__main__":
    main()
