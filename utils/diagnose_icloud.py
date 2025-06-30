#!/usr/bin/env python3
"""
Diagnóstico automático de iCloud Reminders
"""

import requests
import base64
import time

def test_icloud_urls(apple_id, app_password):
    """Probar diferentes URLs de iCloud"""
    
    print(f"🔍 Diagnóstico para: {apple_id}")
    print("=" * 50)
    
    # URLs a probar
    urls_to_test = [
        f"https://caldav.icloud.com/{apple_id}/reminders",
        f"https://caldav.icloud.com/{apple_id}/reminders/",
        f"https://caldav.icloud.com/{apple_id}/",
    ]
    
    headers = {
        'Authorization': f'Basic {base64.b64encode(f"{apple_id}:{app_password}".encode()).decode()}',
        'Content-Type': 'application/xml; charset=utf-8'
    }
    
    propfind_body = """<?xml version="1.0" encoding="utf-8"?>
    <propfind xmlns="DAV:">
        <prop>
            <resourcetype/>
        </prop>
    </propfind>"""
    
    for i, url in enumerate(urls_to_test, 1):
        print(f"\n{i}. Probando: {url}")
        
        try:
            response = requests.request('PROPFIND', url, headers=headers, data=propfind_body, timeout=10)
            
            print(f"   📊 Código: {response.status_code}")
            
            if response.status_code == 200:
                print(f"   ✅ ¡FUNCIONA!")
                return url
            elif response.status_code == 401:
                print(f"   ❌ Credenciales incorrectas")
                break
            elif response.status_code == 403:
                print(f"   ❌ Error 403: Acceso denegado")
            elif response.status_code == 404:
                print(f"   ❌ Error 404: Recurso no encontrado")
            else:
                print(f"   ❌ Error {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        time.sleep(1)  # Pausa entre peticiones
    
    print("\n" + "=" * 50)
    print("📋 RESUMEN DEL DIAGNÓSTICO")
    print("=" * 50)
    
    return None

def main():
    print("🧪 Diagnóstico de iCloud")
    print("=" * 50)
    
    # Solicitar credenciales
    apple_id = input("🍎 Apple ID: ").strip()
    app_password = input("🔑 Contraseña app: ").strip()
    
    if not apple_id or not app_password:
        print("❌ Se requieren credenciales")
        return
    
    if '@' not in apple_id:
        print("❌ El Apple ID debe ser un email válido")
        return
    
    if len(app_password) < 10:
        print("❌ La contraseña específica de app debe tener al menos 10 caracteres")
        return
    
    working_url = test_icloud_urls(apple_id, app_password)
    
    if working_url:
        print(f"\n✅ URL que funciona: {working_url}")
    else:
        print("\n❌ Ninguna URL funcionó")
        print("\n🔧 POSIBLES SOLUCIONES:")
        print("1. Verifica que tu Apple ID sea correcto")
        print("2. Verifica que la contraseña específica de app sea correcta")
        print("3. Asegúrate de tener recordatorios configurados en iCloud")
        print("4. Verifica que tu cuenta de iCloud esté activa")
        print("5. Intenta crear una nueva contraseña específica de app")

if __name__ == "__main__":
    main() 