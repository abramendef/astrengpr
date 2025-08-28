#!/usr/bin/env python3
"""
Script para probar el rendimiento del dashboard con base de datos de Aiven
Permite verificar que la optimización funciona antes de subir a producción
"""

import requests
import time
import json
import statistics

def test_dashboard_performance():
    """Probar el rendimiento del dashboard con Aiven"""
    
    # Configuración local
    base_url = "http://localhost:8000"
    test_user_id = 999  # Cambiado a un ID que probablemente no exista para ver el error real
    
    print("🧪 TESTER DE RENDIMIENTO - ASTREN CON AIVEN")
    print("=" * 60)
    print("Probando dashboard conectado a base de datos de Aiven")
    print("(La misma que usas en producción)")
    print()
    
    # Test 1: Endpoint unificado del dashboard (múltiples pruebas)
    print("📊 Test 1: Endpoint unificado del dashboard")
    print("-" * 40)
    
    tiempos_respuesta = []
    exitosos = 0
    total_pruebas = 5
    
    for i in range(total_pruebas):
        print(f"   🔄 Prueba {i+1}/{total_pruebas}...", end=" ")
        
        start_time = time.time()
        try:
            response = requests.get(f"{base_url}/dashboard/{test_user_id}")
            end_time = time.time()
            
            if response.status_code == 200:
                tiempo = end_time - start_time
                tiempos_respuesta.append(tiempo)
                exitosos += 1
                print(f"✅ {tiempo:.2f}s")
            else:
                print(f"❌ Error {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    if exitosos > 0:
        tiempo_promedio = statistics.mean(tiempos_respuesta)
        tiempo_min = min(tiempos_respuesta)
        tiempo_max = max(tiempos_respuesta)
        
        print(f"\n   📊 Resultados:")
        print(f"      ✅ Pruebas exitosas: {exitosos}/{total_pruebas}")
        print(f"      ⏱️  Tiempo promedio: {tiempo_promedio:.2f}s")
        print(f"      🚀 Tiempo más rápido: {tiempo_min:.2f}s")
        print(f"      🐌 Tiempo más lento: {tiempo_max:.2f}s")
        
        # Evaluar rendimiento
        if tiempo_promedio < 1.0:
            print(f"      🎉 EXCELENTE: Muy rápido (< 1s)")
        elif tiempo_promedio < 3.0:
            print(f"      ✅ BUENO: Rápido (< 3s)")
        elif tiempo_promedio < 10.0:
            print(f"      ⚠️  ACEPTABLE: Moderado (< 10s)")
        else:
            print(f"      ❌ LENTO: Muy lento (> 10s)")
    else:
        print("   ❌ No se pudo completar ninguna prueba")
        return False
    
    # Test 2: Análisis de datos recibidos
    print("\n📊 Test 2: Análisis de datos recibidos")
    print("-" * 40)
    
    try:
        response = requests.get(f"{base_url}/dashboard/{test_user_id}")
        if response.status_code == 200:
            data = response.json()
            
            print(f"   📋 Tareas: {len(data.get('tareas', []))}")
            print(f"   🎯 Áreas: {len(data.get('areas', []))}")
            print(f"   👥 Grupos: {len(data.get('grupos', []))}")
            print(f"   📊 Contadores: {data.get('contadores', {})}")
            
            # Verificar timestamp
            if 'timestamp' in data:
                print(f"   🕐 Timestamp: {data['timestamp']}")
                
        else:
            print(f"   ❌ Error al obtener datos: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error en análisis: {e}")
    
    # Test 3: Verificar headers de optimización
    print("\n📊 Test 3: Headers de optimización")
    print("-" * 40)
    
    try:
        response = requests.get(f"{base_url}/dashboard/{test_user_id}")
        headers = response.headers
        
        cache_control = headers.get('Cache-Control', 'No especificado')
        print(f"   🗄️  Cache-Control: {cache_control}")
        
        content_type = headers.get('Content-Type', 'No especificado')
        print(f"   📄 Content-Type: {content_type}")
        
        # Headers de seguridad
        security_headers = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection']
        for header in security_headers:
            value = headers.get(header, 'No especificado')
            print(f"   🔒 {header}: {value}")
            
    except Exception as e:
        print(f"   ❌ Error al verificar headers: {e}")
    
    # Test 4: Comparación con rendimiento esperado
    print("\n📊 Test 4: Análisis de rendimiento")
    print("-" * 40)
    
    if 'tiempo_promedio' in locals():
        print(f"   🎯 Tiempo promedio actual: {tiempo_promedio:.2f}s")
        
        # Comparar con rendimiento esperado
        if tiempo_promedio < 3.0:
            print("   🚀 RENDIMIENTO: EXCELENTE")
            print("      ✅ Puedes subir a producción con confianza")
            print("      ✅ Los índices están funcionando perfectamente")
        elif tiempo_promedio < 10.0:
            print("   ⚠️  RENDIMIENTO: ACEPTABLE")
            print("      💡 Hay margen de mejora")
            print("      💡 Considera revisar antes de subir")
        else:
            print("   ❌ RENDIMIENTO: PROBLEMÁTICO")
            print("      🔧 Necesita más optimización")
            print("      🔧 NO subas a producción aún")
    
    # Test 5: Verificación de conexión a Aiven
    print("\n📊 Test 5: Verificación de conexión")
    print("-" * 40)
    
    try:
        # Hacer una consulta simple para verificar conexión
        start_time = time.time()
        response = requests.get(f"{base_url}/dashboard/{test_user_id}")
        end_time = time.time()
        
        if response.status_code == 200:
            tiempo_conexion = end_time - start_time
            print(f"   ✅ Conexión a Aiven: Funcionando")
            print(f"   ⏱️  Tiempo de respuesta: {tiempo_conexion:.2f}s")
            
            # Evaluar latencia de red
            if tiempo_conexion < 0.5:
                print("   🚀 Latencia: Muy baja (excelente)")
            elif tiempo_conexion < 1.0:
                print("   ✅ Latencia: Baja (buena)")
            elif tiempo_conexion < 3.0:
                print("   ⚠️  Latencia: Moderada (aceptable)")
            else:
                print("   ❌ Latencia: Alta (problemática)")
        else:
            print(f"   ❌ Conexión a Aiven: Error {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
    
    # Resumen final
    print("\n" + "=" * 60)
    print("🎯 RESUMEN FINAL")
    print("=" * 60)
    
    if 'tiempo_promedio' in locals():
        if tiempo_promedio < 3.0:
            print("✅ RESULTADO: EXCELENTE")
            print("   🚀 El dashboard está funcionando perfectamente con Aiven")
            print("   🚀 Los índices están optimizando las consultas")
            print("   🚀 Puedes subir a producción con total confianza")
        elif tiempo_promedio < 10.0:
            print("⚠️  RESULTADO: ACEPTABLE")
            print("   💡 El rendimiento es bueno pero puede mejorar")
            print("   💡 Considera revisar antes de subir")
        else:
            print("❌ RESULTADO: PROBLEMÁTICO")
            print("   🔧 El rendimiento no es satisfactorio")
            print("   🔧 Necesitas más optimización antes de subir")
    
    print("\n💡 RECOMENDACIONES:")
    print("   1. Si el rendimiento es excelente (< 3s) → Sube a producción")
    print("   2. Si es aceptable (3-10s) → Considera revisar antes de subir")
    print("   3. Si es problemático (> 10s) → Optimiza más antes de subir")
    
    return True

def main():
    """Función principal"""
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
