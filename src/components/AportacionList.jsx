import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const AportacionList = ({ aportaciones, desbloqueado, loading, onRefresh }) => {
  const { user } = useAuth();
  const [editandoId, setEditandoId] = useState(null);
  const [editContenido, setEditContenido] = useState("");

  const propias = aportaciones.filter((a) => a.autor_id === user.id);
  const otras = aportaciones.filter((a) => a.autor_id !== user.id);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta carta?")) {
      const { error } = await supabase
        .from("aportaciones")
        .delete()
        .eq("id", id);
      if (error) {
        alert("Error al eliminar: " + error.message);
      } else {
        if (onRefresh) onRefresh();
      }
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

    // Obtener nombre del perfil si existe, sino "Compañero"
    const nombreRemitente = esPropia
      ? "Tú"
      : aportacion.profiles?.username || "Compañero";

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
              {esPropia && (
                <div className="flex gap-1 ml-auto">
                  {!esEdicion && (
                    <>
                      <button
                        onClick={() => handleEdit(aportacion)}
                        className="text-xs text-marronClaro hover:text-terracotaIntenso px-1"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(aportacion.id)}
                        className="text-xs text-marronClaro hover:text-red-500 px-1"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </>
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
