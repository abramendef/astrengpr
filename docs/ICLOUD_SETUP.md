# Configuración de iCloud Reminders para Astren

## 🍎 Requisitos Previos

1. **Cuenta de Apple ID activa**
2. **Verificación en dos pasos habilitada**
3. **Recordatorios configurados en iCloud**

## 🔑 Generar Contraseña Específica de App

### Paso 1: Acceder a appleid.apple.com
1. Ve a [appleid.apple.com](https://appleid.apple.com)
2. Inicia sesión con tu Apple ID

### Paso 2: Habilitar Verificación en Dos Pasos
1. En la sección "Seguridad", verifica que "Verificación en dos pasos" esté habilitada
2. Si no está habilitada, sigue las instrucciones para activarla

### Paso 3: Generar Contraseña Específica de App
1. En la sección "Seguridad", busca "Contraseñas específicas de app"
2. Haz clic en "Generar contraseña"
3. Selecciona "Otro (nombre personalizado)"
4. Escribe un nombre como "Astren Task Manager"
5. Haz clic en "Crear"
6. **Copia la contraseña generada** (es de 12 caracteres, sin espacios)

## 🧪 Probar la Conexión

### Opción 1: Usar el Script de Prueba
```bash
python test_icloud.py
```

### Opción 2: Probar Manualmente
1. Abre la página de sincronización en Astren
2. Haz clic en "Conectar con iCloud"
3. Ingresa tu Apple ID y la contraseña específica de app
4. Haz clic en "Conectar"

## ❌ Errores Comunes y Soluciones

### Error 401: Credenciales Incorrectas
**Síntomas:** "Credenciales incorrectas. Verifica tu Apple ID y contraseña específica de app"

**Soluciones:**
- Verifica que tu Apple ID sea correcto (debe ser un email válido)
- Asegúrate de que la contraseña específica de app sea exactamente como se generó
- Genera una nueva contraseña específica de app

### Error 403: Acceso Denegado
**Síntomas:** "Acceso denegado. Asegúrate de que la contraseña específica de app tenga permisos para CalDAV"

**Soluciones:**
- Verifica que tu cuenta de iCloud esté activa
- Asegúrate de que tengas recordatorios configurados en iCloud
- Intenta crear una nueva contraseña específica de app

### Error 404: Recurso No Encontrado
**Síntomas:** "Recurso no encontrado"

**Soluciones:**
- Verifica que tengas recordatorios configurados en iCloud
- Intenta crear al menos un recordatorio en la app de Recordatorios
- Verifica que tu Apple ID sea correcto

### Error de Tiempo de Espera
**Síntomas:** "Tiempo de espera agotado"

**Soluciones:**
- Verifica tu conexión a internet
- Intenta nuevamente en unos minutos
- Verifica que no haya restricciones de firewall

## 🔧 Configuración Avanzada

### URLs Alternativas
Si la URL principal no funciona, el sistema probará automáticamente estas URLs alternativas:
- `https://caldav.icloud.com/{apple_id}/reminders/`
- `https://caldav.icloud.com/{apple_id}/`
- `https://caldav.icloud.com/{apple_id}/reminders/default`
- `https://caldav.icloud.com/{apple_id}/reminders/principal`

### Permisos de CalDAV
La contraseña específica de app debe tener permisos para:
- CalDAV (Calendario)
- Recordatorios
- iCloud Drive (opcional)

## 📱 Verificar Configuración en Dispositivos

### En iPhone/iPad:
1. Ve a Configuración > [Tu Nombre] > iCloud
2. Verifica que "Recordatorios" esté habilitado
3. Crea un recordatorio de prueba

### En Mac:
1. Ve a Preferencias del Sistema > ID de Apple > iCloud
2. Verifica que "Recordatorios" esté habilitado
3. Abre la app Recordatorios y crea un recordatorio de prueba

### En Windows:
1. Instala iCloud para Windows
2. Inicia sesión con tu Apple ID
3. Verifica que "Recordatorios" esté habilitado

## 🚨 Limitaciones Conocidas

1. **Sincronización Unidireccional:** Por ahora, solo se pueden leer recordatorios de iCloud
2. **Parsing XML:** La implementación actual devuelve tareas de ejemplo
3. **Autenticación:** Las credenciales se almacenan temporalmente en memoria

## 🔒 Seguridad

- Las credenciales se almacenan temporalmente en memoria del servidor
- No se guardan permanentemente en disco
- Se recomienda usar HTTPS en producción
- Considera implementar encriptación para las credenciales

## 📞 Soporte

Si continúas teniendo problemas:

1. Ejecuta el script de prueba: `python test_icloud.py`
2. Verifica que todos los requisitos previos estén cumplidos
3. Intenta crear una nueva contraseña específica de app
4. Verifica que tu cuenta de iCloud esté activa y funcional

## 🔄 Próximas Mejoras

- [ ] Sincronización bidireccional completa
- [ ] Parsing XML de recordatorios reales
- [ ] Almacenamiento seguro de credenciales
- [ ] Sincronización automática programada
- [ ] Soporte para múltiples listas de recordatorios 