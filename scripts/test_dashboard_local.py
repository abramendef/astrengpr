#!/usr/bin/env python3
"""
Script para probar el dashboard localmente con la base de datos optimizada
Permite verificar que la optimización funciona antes de subir a producción
"""

import requests
import time
import json
from dotenv import load_dotenv
import os
from pathlib import Path

# Cargar configuración local
env_path = Path(__file__).parent / 'test_local.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Archivo test_local.env cargado desde: {env_path}")
else:
    print(f"⚠️ No se encontró test_local.env en: {env_path}")
    load_dotenv()

def test_dashboard_performance():
    """Probar el rendimiento del dashboard localmente"""
    
    # Configuración local
    base_url = "http://localhost:5000"
    test_user_id = 1  # Cambia esto por un ID de usuario real
    
    print("🧪 Iniciando pruebas de rendimiento del dashboard...")
    print("=" * 60)
    
    # Test 1: Endpoint unificado del dashboard
    print("\n📊 Test 1: Endpoint unificado del dashboard")
    print("-" * 40)
    
    start_time = time.time()
    try:
        response = requests.get(f"{base_url}/dashboard/{test_user_id}")
        end_time = time.time()
        
        if response.status_code == 200:
            tiempo_respuesta = end_time - start_time
            print(f"✅ Éxito: {tiempo_respuesta:.2f} segundos")
            
            # Analizar datos recibidos
            data = response.json()
            print(f"   📋 Tareas recibidas: {len(data.get('tareas', []))}")
            print(f"   🎯 Áreas recibidas: {len(data.get('areas', []))}")
            print(f"   👥 Grupos recibidos: {len(data.get('grupos', []))}")
            print(f"   📊 Contadores: {data.get('contadores', {})}")
            
            # Evaluar rendimiento
            if tiempo_respuesta < 1.0:
                print("   🚀 EXCELENTE: Respuesta muy rápida (< 1s)")
            elif tiempo_respuesta < 3.0:
                print("   ✅ BUENO: Respuesta rápida (< 3s)")
            elif tiempo_respuesta < 10.0:
                print("   ⚠️ ACEPTABLE: Respuesta moderada (< 10s)")
            else:
                print("   ❌ LENTO: Respuesta muy lenta (> 10s)")
                
        else:
            print(f"❌ Error HTTP: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al servidor local")
        print("   💡 Asegúrate de que Flask esté ejecutándose en localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False
    
    # Test 2: Comparar con endpoint anterior (si existe)
    print("\n📊 Test 2: Comparación con endpoints individuales")
    print("-" * 40)
    
    endpoints = [
        f"/tareas/{test_user_id}",
        f"/areas/{test_user_id}",
        f"/grupos/{test_user_id}",
        f"/contadores/{test_user_id}"
    ]
    
    total_time_individual = 0
    successful_individual = 0
    
    for endpoint in endpoints:
        start_time = time.time()
        try:
            response = requests.get(f"{base_url}{endpoint}")
            end_time = time.time()
            
            if response.status_code == 200:
                tiempo = end_time - start_time
                total_time_individual += tiempo
                successful_individual += 1
                print(f"   ✅ {endpoint}: {tiempo:.2f}s")
            else:
                print(f"   ❌ {endpoint}: Error {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ {endpoint}: Error - {e}")
    
    if successful_individual > 0:
        tiempo_promedio = total_time_individual / successful_individual
        print(f"\n   📊 Tiempo promedio endpoints individuales: {tiempo_promedio:.2f}s")
        
        # Comparar con endpoint unificado
        if 'tiempo_respuesta' in locals():
            if tiempo_respuesta < tiempo_promedio:
                mejora = ((tiempo_promedio - tiempo_respuesta) / tiempo_promedio) * 100
                print(f"   🚀 El endpoint unificado es {mejora:.1f}% más rápido!")
            else:
                print(f"   ⚠️ El endpoint unificado no muestra mejora en esta prueba")
    
    # Test 3: Verificar caché y headers
    print("\n📊 Test 3: Verificación de caché y headers")
    print("-" * 40)
    
    try:
        response = requests.get(f"{base_url}/dashboard/{test_user_id}")
        headers = response.headers
        
        cache_control = headers.get('Cache-Control', 'No especificado')
        print(f"   🗄️ Cache-Control: {cache_control}")
        
        content_type = headers.get('Content-Type', 'No especificado')
        print(f"   📄 Content-Type: {content_type}")
        
        # Verificar si hay headers de seguridad
        security_headers = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection']
        for header in security_headers:
            value = headers.get(header, 'No especificado')
            print(f"   🔒 {header}: {value}")
            
    except Exception as e:
        print(f"   ❌ Error al verificar headers: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    if 'tiempo_respuesta' in locals():
        if tiempo_respuesta < 3.0:
            print("✅ RENDIMIENTO: EXCELENTE - El dashboard está funcionando muy bien")
            print("   🚀 Puedes proceder a subir a producción")
        elif tiempo_respuesta < 10.0:
            print("⚠️ RENDIMIENTO: ACEPTABLE - Hay margen de mejora")
            print("   💡 Considera revisar la configuración antes de subir")
        else:
            print("❌ RENDIMIENTO: PROBLEMÁTICO - Necesita más optimización")
            print("   🔧 Revisa la configuración antes de subir a producción")
    
    print("\n💡 RECOMENDACIONES:")
    print("   1. Si el rendimiento es bueno (< 3s), puedes subir a producción")
    print("   2. Si es lento (> 10s), revisa la configuración de la base de datos")
    print("   3. Verifica que los índices se crearon correctamente")
    
    return True

def main():
    """Función principal"""
    print("🧪 TESTER LOCAL DEL DASHBOARD - ASTREN")
    print("=" * 60)
    print("Este script prueba el rendimiento del dashboard localmente")
    print("antes de subir a producción.")
    print()
    
    try:
        success = test_dashboard_performance()
        if success:
            print("\n🎉 Pruebas completadas exitosamente")
        else:
            print("\n❌ Las pruebas no se pudieron completar")
            
    except KeyboardInterrupt:
        print("\n⚠️ Pruebas canceladas por el usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")

if __name__ == "__main__":
    main()
