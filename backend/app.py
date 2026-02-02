"""
AstrenGPR - Servidor mínimo para servir frontend estático
Este es un punto de entrada para despliegue en plataformas como Render.
El código real del backend no está incluido en este snapshot.
"""

import os
from flask import Flask, send_from_directory, send_file

app = Flask(__name__, static_folder='../frontend', static_url_path='')

# Configuración
PORT = int(os.getenv('PORT', 8000))
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend')


@app.route('/')
def index():
    """Servir la página principal"""
    return send_file(os.path.join(FRONTEND_DIR, 'index.html'))


@app.route('/<path:filename>')
def serve_static(filename):
    """Servir archivos estáticos (HTML, CSS, JS, imágenes)"""
    filepath = os.path.join(FRONTEND_DIR, filename)
    
    # Validar que el archivo está dentro de FRONTEND_DIR (seguridad)
    if not os.path.abspath(filepath).startswith(os.path.abspath(FRONTEND_DIR)):
        return "Not Found", 404
    
    # Si es una ruta sin extensión, intenta agregar .html
    if not os.path.isfile(filepath) and not '.' in os.path.basename(filepath):
        html_path = filepath + '.html'
        if os.path.isfile(html_path):
            return send_file(html_path)
    
    # Servir archivo si existe
    if os.path.isfile(filepath):
        return send_file(filepath)
    
    # Si no existe, servir 404 con index.html (para SPA routing)
    return send_file(os.path.join(FRONTEND_DIR, 'index.html')), 404


@app.errorhandler(404)
def handle_404(e):
    """Fallback: servir index.html para rutas no encontradas (SPA routing)"""
    return send_file(os.path.join(FRONTEND_DIR, 'index.html')), 200


if __name__ == '__main__':
    print(f"Iniciando servidor AstrenGPR en puerto {PORT}")
    print(f"Sirviendo frontend desde: {FRONTEND_DIR}")
    app.run(host='0.0.0.0', port=PORT, debug=False)
