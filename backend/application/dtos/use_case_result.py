"""
Resultado de caso de uso - FagSol Escuela Virtual
"""

from dataclasses import dataclass
from typing import Optional, Any


@dataclass
class UseCaseResult:
    """
    Resultado estándar de un caso de uso
    
    Attributes:
        success: Indica si la operación fue exitosa
        data: Datos de respuesta (dict)
        error_message: Mensaje de error si success=False
        extra: Datos adicionales (para objetos no serializables como RefreshToken)
    """
    success: bool
    data: Optional[dict] = None
    error_message: Optional[str] = None
    extra: Optional[dict] = None
    
    def to_dict(self) -> dict:
        """
        Convierte el resultado a un diccionario para respuestas JSON
        
        Returns:
            dict con success, data/error_message
        """
        result = {
            'success': self.success
        }
        
        if self.success:
            if self.data:
                result.update(self.data)
        else:
            if self.error_message:
                result['message'] = self.error_message
        
        return result

