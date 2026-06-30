import { useEffect, useState } from "react";
import Contador from "./Contador";
import { getProximoViernes18 } from "../utils/fechas";

const ProximoDesbloqueo = ({ desbloqueado }) => {
  const [proximaFecha, setProximaFecha] = useState(getProximoViernes18());

  useEffect(() => {
    const interval = setInterval(() => {
      setProximaFecha(getProximoViernes18());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (desbloqueado) {
    return (
      <div className="bg-menta/20 border border-menta/40 rounded-2xl p-4 text-center">
        <span className="text-4xl block mb-2">📬</span>
        <p className="text-menta font-semibold text-lg">¡Cartas entregadas!</p>
        <p className="text-marronClaro text-sm">
          Puedes leer las cartas que te han enviado.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-rosaSuave/30 border border-terracota/20 rounded-2xl p-4 text-center">
      <span className="text-4xl block mb-2">🦉</span>
      <p className="text-marron font-medium">Tiempo de entrega</p>
      <Contador
        fechaObjetivo={proximaFecha.toISOString()}
        className="text-sm"
      />
      <p className="text-xs text-marronClaro mt-2 flex items-center justify-center gap-1">
        ⏰ Viernes 18:00
      </p>
    </div>
  );
};

export default ProximoDesbloqueo;
