import { useEffect, useRef } from "react";

/**
 * Hook personalizado para ejecutar una función periódicamente
 * @param callback Función a ejecutar periódicamente
 * @param delay Tiempo en milisegundos entre ejecuciones (por defecto 5 minutos)
 * @param enabled Si está habilitada la actualización periódica
 */
export function usePeriodicRefresh(
  callback: () => void,
  delay: number = 5 * 60 * 1000,
  enabled: boolean = true
): void {
  // Usar una ref para almacenar la función de callback para evitar re-renders innecesarios
  const savedCallback = useRef<() => void>(callback);

  // Actualizar la ref cada vez que el callback cambie
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Configurar el intervalo
  useEffect(() => {
    if (!enabled) return;

    // Ejecutar inmediatamente al montar el componente
    savedCallback.current();

    // Función para manejar cada tick del intervalo
    const tick = () => {
      savedCallback.current();
    };

    // Configurar el intervalo
    const intervalId = setInterval(tick, delay);

    // Limpiar el intervalo al desmontar
    return () => clearInterval(intervalId);
  }, [delay, enabled]);
}
