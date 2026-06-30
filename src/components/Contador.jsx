import { useEffect, useState } from "react";

const Contador = ({ fechaObjetivo, className = "" }) => {
  const [tiempo, setTiempo] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });
  const [finalizado, setFinalizado] = useState(false);

  useEffect(() => {
    const calcular = () => {
      const ahora = new Date().getTime();
      const objetivo = new Date(fechaObjetivo).getTime();
      const diff = objetivo - ahora;

      if (diff <= 0) {
        setFinalizado(true);
        setTiempo({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
        return;
      }

      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
      const horas = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diff % (1000 * 60)) / 1000);

      setTiempo({ dias, horas, minutos, segundos });
      setFinalizado(false);
    };

    calcular();
    const interval = setInterval(calcular, 1000);
    return () => clearInterval(interval);
  }, [fechaObjetivo]);

  if (finalizado) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-2xl font-bold text-menta">¡Ya es momento! 🎉</p>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="flex justify-center gap-3 text-3xl font-mono font-bold text-terracotaIntenso">
        <div>
          <span className="block text-4xl">
            {String(tiempo.dias).padStart(2, "0")}
          </span>
          <span className="text-xs font-sans font-normal text-marronClaro">
            Días
          </span>
        </div>
        <span className="text-4xl text-marronClaro">:</span>
        <div>
          <span className="block text-4xl">
            {String(tiempo.horas).padStart(2, "0")}
          </span>
          <span className="text-xs font-sans font-normal text-marronClaro">
            Horas
          </span>
        </div>
        <span className="text-4xl text-marronClaro">:</span>
        <div>
          <span className="block text-4xl">
            {String(tiempo.minutos).padStart(2, "0")}
          </span>
          <span className="text-xs font-sans font-normal text-marronClaro">
            Min
          </span>
        </div>
        <span className="text-4xl text-marronClaro">:</span>
        <div>
          <span className="block text-4xl">
            {String(tiempo.segundos).padStart(2, "0")}
          </span>
          <span className="text-xs font-sans font-normal text-marronClaro">
            Seg
          </span>
        </div>
      </div>
    </div>
  );
};

export default Contador;
