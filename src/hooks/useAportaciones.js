import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export const useAportaciones = () => {
  const { user } = useAuth();
  const [aportaciones, setAportaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [desbloqueado, setDesbloqueado] = useState(false);

  console.log("👤 Usuario en useAportaciones:", user);

  const checkDesbloqueo = async () => {
    const { data, error } = await supabase.rpc("is_weekend_unlocked");
    if (!error) setDesbloqueado(data);
    else console.error("Error al verificar desbloqueo:", error);
  };

  const fetchAportaciones = async () => {
    setLoading(true);
    console.log("🔄 Ejecutando fetchAportaciones...");

    // Intentar consulta con JOIN a profiles
    let { data, error } = await supabase
      .from("aportaciones")
      .select(
        `
        *,
        profiles:autor_id (username)
      `,
      )
      .order("created_at", { ascending: false });

    // Si falla el JOIN (porque no existe profiles), hacer consulta simple
    if (error && error.message.includes('relation "profiles" does not exist')) {
      console.warn(
        "⚠️ Tabla profiles no encontrada, consultando solo aportaciones...",
      );
      const { data: simpleData, error: simpleError } = await supabase
        .from("aportaciones")
        .select("*")
        .order("created_at", { ascending: false });

      data = simpleData;
      error = simpleError;
    }

    console.log("📦 Datos de aportaciones:", data);
    console.log("❌ Error de aportaciones:", error);

    if (error) {
      setError(error.message);
      setAportaciones([]);
    } else {
      setAportaciones(data || []);
    }
    setLoading(false);
  };

  const crearAportacion = async (contenido, mediaFile = null) => {
    let mediaUrl = null;
    if (mediaFile) {
      if (!mediaFile.name) {
        throw new Error(
          "El archivo adjunto no es válido (nombre no disponible).",
        );
      }

      const fileExt = mediaFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("aportaciones-media")
        .upload(fileName, mediaFile);

      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("aportaciones-media")
        .getPublicUrl(fileName);
      mediaUrl = urlData.publicUrl;
    }

    const fechaInicio = new Date("2024-01-01").getTime();
    const ahora = Date.now();
    const diff = ahora - fechaInicio;
    const semanaId = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;

    const { data, error } = await supabase
      .from("aportaciones")
      .insert({
        autor_id: user.id,
        tipo: "carta",
        contenido: contenido || "",
        media_url: mediaUrl,
        semana_id: semanaId,
      })
      .select();

    if (error) throw error;
    await fetchAportaciones();
    return data;
  };

  useEffect(() => {
    console.log("🔄 useEffect de useAportaciones ejecutado. user:", user);
    if (user) {
      checkDesbloqueo();
      fetchAportaciones();
    } else {
      console.warn("⚠️ No hay usuario autenticado, no se cargan aportaciones.");
      setLoading(false);
    }
  }, [user]);

  return {
    aportaciones,
    loading,
    error,
    desbloqueado,
    fetchAportaciones,
    crearAportacion,
    checkDesbloqueo,
  };
};
