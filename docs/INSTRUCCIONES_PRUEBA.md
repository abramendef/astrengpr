# 🧪 Instrucciones para Probar el Buscador

## Problema Identificado
El buscador no está funcionando correctamente. Vamos a diagnosticar y solucionar el problema.

## 🔍 Pasos para Diagnosticar

### 1. Verificar el Servidor
```bash
# En la terminal, desde la carpeta del proyecto:
cd frontend
python -m http.server 8000
```

### 2. Probar las Páginas de Test

#### Opción A: Test Simple (Recomendado)
1. Abrir en el navegador: `http://localhost:8000/../simple_test.html`
2. Escribir "astren ia" en el buscador
3. Presionar Enter o hacer clic en "Buscar"
4. Verificar si redirige a la página IA secreta

#### Opción B: Test Completo
1. Abrir en el navegador: `http://localhost:8000/../debug_search.html`
2. Usar los botones de debug para verificar cada componente
3. Revisar la consola del navegador (F12) para ver logs

#### Opción C: Página Principal
1. Abrir en el navegador: `http://localhost:8000/index.html`
2. Buscar el campo de búsqueda en el header
3. Escribir "astren ia" y probar

### 3. Verificar la Consola del Navegador
1. Presionar F12 para abrir las herramientas de desarrollador
2. Ir a la pestaña "Console"
3. Buscar mensajes que empiecen con:
   - ✅ SearchManager: (éxito)
   - ❌ SearchManager: (error)
   - 🔍 SearchManager: (búsqueda)

## 🐛 Posibles Problemas y Soluciones

### Problema 1: Elementos no encontrados
**Síntoma**: Mensaje "❌ SearchManager: Elementos no encontrados"
**Solución**: Verificar que los IDs `search-input` y `search-button` existan en el HTML

### Problema 2: JavaScript no se carga
**Síntoma**: No hay mensajes de SearchManager en la consola
**Solución**: Verificar que `scripts.js` se esté cargando correctamente

### Problema 3: Redirección no funciona
**Síntoma**: La búsqueda se ejecuta pero no redirige
**Solución**: Verificar que `ia-secreta.html` existe en la ruta correcta

### Problema 4: Estilos no se aplican
**Síntoma**: El buscador no se ve bien
**Solución**: Verificar que `styles.css` se esté cargando

## 📋 Checklist de Verificación

- [ ] Servidor Python ejecutándose en puerto 8000
- [ ] Página `simple_test.html` carga correctamente
- [ ] Campo de búsqueda visible y funcional
- [ ] Botón de búsqueda responde a clics
- [ ] Tecla Enter funciona en el campo de búsqueda
- [ ] Búsqueda "astren ia" redirige a `ia-secreta.html`
- [ ] Mensajes de debug aparecen en la consola
- [ ] No hay errores JavaScript en la consola

## 🚀 Comandos Rápidos

```bash
# Iniciar servidor
cd frontend && python -m http.server 8000

# Abrir páginas de test
# http://localhost:8000/../simple_test.html
# http://localhost:8000/../debug_search.html
# http://localhost:8000/index.html
```

## 📞 Si Sigue Sin Funcionar

1. **Revisar la consola del navegador** para errores específicos
2. **Verificar las rutas de archivos** - asegurarse de que todos los archivos estén en su lugar
3. **Probar con el test simple** primero para aislar el problema
4. **Verificar que no haya conflictos** con otros scripts JavaScript

## 🎯 Resultado Esperado

Al escribir "astren ia" en el buscador y presionar Enter, deberías:
1. Ver un mensaje de éxito en la consola
2. Ser redirigido automáticamente a la página `ia-secreta.html`
3. Ver la página secreta con el mensaje "IA Secreta de Astren" 