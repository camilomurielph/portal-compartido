// src/utils/fechas.js

// Devuelve el próximo viernes a las 18:00 (hora local)
export const getProximoViernes18 = () => {
  const ahora = new Date();
  const dia = ahora.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
  const horas = ahora.getHours();
  const minutos = ahora.getMinutes();
  const segundos = ahora.getSeconds();

  // Si es viernes (5) y ya pasaron las 18:00, el próximo es la próxima semana
  let diasHastaViernes = (5 - dia + 7) % 7;
  if (dia === 5 && horas >= 18) {
    diasHastaViernes = 7;
  }

  const proximoViernes = new Date(ahora);
  proximoViernes.setDate(ahora.getDate() + diasHastaViernes);
  proximoViernes.setHours(18, 0, 0, 0); // 18:00:00.000
  return proximoViernes;
};
