import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const AportacionList = ({ aportaciones, desbloqueado, loading, onRefresh }) => {
  const { user } = useAuth();
  const [editandoId, setEditandoId] = useState(null);
  const [editContenido, setEditContenido] = useState("");

  const propias = aportaciones.filter((a) => a.autor_id === user.id);
  const otras = aportaciones.filter((a) => a.autor_id !== user.id);

  // Email del usuario de pruebas (puede eliminar cualquier carta, incluso recibidas)
  const USER_PRUEBA = "camilomuriel.kam@gmail.com";
  const esUsuarioPrueba = user?.email === USER_PRUEBA;

  const handleDelete = async (id, esPropia) => {
    // Verificar si la carta ya fue recibida (existe en lecturas)
    const { data: lecturas, error: lecturasError } = await supabase
      .from("lecturas")
      .select("id")
      .eq("carta_id", id)
      .maybeSingle();

    if (lecturasError) {
      alert(
        "Error al verificar si la carta fue recibida: " + lecturasError.message,
      );
      return;
    }

    // Si la carta está en lecturas y el usuario NO es el de pruebas, mostrar mensaje
    if (lecturas && !esUsuarioPrueba) {
      alert(
        "📮 No puedes borrar una carta que ya fue recibida por tu compañero.",
      );
      return;
    }

    // Mensaje de confirmación personalizado
    let mensaje = "¿Estás seguro de que quieres eliminar esta carta?";
    if (esUsuarioPrueba && !esPropia) {
      mensaje =
        "⚠️ Vas a eliminar una carta que te envió tu compañero. ¿Continuar?";
    } else if (esUsuarioPrueba && esPropia && lecturas) {
      mensaje =
        "⚠️ Esta carta ya fue recibida, pero como eres usuario de pruebas, puedes eliminarla. ¿Continuar?";
    }

    if (!window.confirm(mensaje)) return;

    const { error } = await supabase.from("aportaciones").delete().eq("id", id);

    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      if (onRefresh) onRefresh();
    }
  };

  const handleEdit = (aportacion) => {
    setEditandoId(aportacion.id);
    setEditContenido(aportacion.contenido);
  };

  const handleUpdate = async (id) => {
    const { error } = await supabase
      .from("aportaciones")
      .update({ contenido: editContenido })
      .eq("id", id);
    if (error) {
      alert("Error al editar: " + error.message);
    } else {
      setEditandoId(null);
      if (onRefresh) onRefresh();
    }
  };

  const renderAportacion = (aportacion, esPropia) => {
    const esEdicion = editandoId === aportacion.id;
    const nombreRemitente = esPropia
      ? "Tú"
      : aportacion.profiles?.username || "Compañero";

    // Mostrar botones de acción solo si:
    // - Es propia (siempre)
    // - O es del otro y el usuario actual es el de pruebas (solo eliminar)
    const mostrarAcciones = esPropia || (esUsuarioPrueba && !esPropia);

    return (
      <div
        key={aportacion.id}
        className="glass-card rounded-2xl p-4 border-l-4 border-terracota hover:shadow-lg transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-rosaSuave flex items-center justify-center flex-shrink-0 text-lg">
            {esPropia ? "📝" : "🦉"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-marron">{nombreRemitente}</span>
              <span className="text-xs text-marronClaro">·</span>
              <span className="text-xs text-marronClaro">
                {new Date(aportacion.created_at).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {mostrarAcciones && (
                <div className="flex gap-1 ml-auto">
                  {esPropia && !esEdicion && (
                    <button
                      onClick={() => handleEdit(aportacion)}
                      className="text-xs text-marronClaro hover:text-terracotaIntenso px-1"
                      title="Editar"
                    >
                      ✏️
                    </button>
                  )}
                  {!esEdicion && (
                    <button
                      onClick={() => handleDelete(aportacion.id, esPropia)}
                      className="text-xs text-marronClaro hover:text-red-500 px-1"
                      title={esPropia ? "Eliminar" : "Eliminar (modo pruebas)"}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>

            {esEdicion ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editContenido}
                  onChange={(e) => setEditContenido(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-marronClaro/20 rounded-xl bg-crema/50 focus:outline-none focus:ring-2 focus:ring-terracota"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(aportacion.id)}
                    className="px-3 py-1 bg-terracota text-white rounded-lg text-xs hover:bg-terracotaIntenso"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditandoId(null)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {aportacion.media_url ? (
                  <img
                    src={aportacion.media_url}
                    alt="Carta"
                    className="mt-2 rounded-xl max-h-60 object-cover shadow-sm w-full"
                  />
                ) : (
                  <p className="mt-2 text-marron whitespace-pre-wrap leading-relaxed text-sm">
                    {aportacion.contenido}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-terracota/30 border-t-terracota rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold text-marron flex items-center gap-2">
          📮 Mis cartas
        </h3>
        {propias.length === 0 ? (
          <p className="text-marronClaro italic mt-2 text-center py-4 bg-blancoRoto/50 rounded-2xl text-sm">
            No has escrito ninguna carta aún.
          </p>
        ) : (
          <div className="space-y-3 mt-2">
            {propias.map((a) => renderAportacion(a, true))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-marron flex items-center gap-2">
          {desbloqueado ? "🦉 Cartas recibidas" : "🦉 Cartas en camino"}
        </h3>
        {!desbloqueado ? (
          <div className="bg-gradient-to-br from-rosaSuave/30 to-blancoRoto/50 border border-terracota/10 rounded-2xl p-5 text-center mt-2">
            <span className="text-4xl block mb-2">⏳</span>
            <p className="text-marron font-medium">Esperando entrega</p>
            <p className="text-sm text-marronClaro">
              Las cartas llegan el viernes a las 18:00
            </p>
          </div>
        ) : otras.length === 0 ? (
          <p className="text-marronClaro italic mt-2 text-center py-4 bg-blancoRoto/50 rounded-2xl text-sm">
            No hay cartas recibidas aún.
          </p>
        ) : (
          <div className="space-y-3 mt-2">
            {otras.map((a) => renderAportacion(a, false))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AportacionList;
