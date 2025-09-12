import os
import sys
from unittest.mock import MagicMock


# Add backend directory to path to import app module
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))
import app  # noqa: E402


def test_aceptar_invitacion_cierra_conexion_monkeypatch(monkeypatch):
    """La función debe cerrar cursor y conexión si la invitación no existe."""

    # Preparar mocks para conexión y cursor
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = None  # Simular invitación inexistente
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor

    # Parchar dependencias para evitar acceso a la base de datos real
    monkeypatch.setattr(app, "get_db_connection", lambda: mock_conn)
    monkeypatch.setattr(app, "verificar_miembro_grupo", lambda grupo_id, usuario_id: False)
    monkeypatch.setattr(app, "notificar_aceptacion_invitacion", lambda grupo_id, usuario_id, rol: None)

    # Ejecutar función
    resultado = app.aceptar_invitacion_grupo(1, 2)

    # Validar
    assert resultado is False
    mock_cursor.close.assert_called_once()
    mock_conn.close.assert_called_once()

