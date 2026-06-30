import { useState, useRef } from "react";

const AportacionForm = ({ onCreate, onCancel }) => {
  const [contenido, setContenido] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contenido.trim() && !mediaFile) {
      alert("Escribe algo o adjunta una imagen.");
      return;
    }
    setSubiendo(true);
    try {
      await onCreate(contenido, mediaFile);
      setContenido("");
      setMediaFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      alert("Error al enviar la carta: " + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Solo se permiten imágenes.");
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no puede superar los 5MB.");
        e.target.value = "";
        return;
      }
      setMediaFile(file);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card rounded-3xl p-5 border border-terracota/10 space-y-4"
    >
      <div className="flex items-center gap-2 text-marron">
        <span className="text-2xl">✍️</span>
        <h2 className="text-lg font-semibold">Escribe tu carta</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-marron">
          Contenido
        </label>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={5}
          placeholder="Escribe lo que quieras decirle... (puedes pegar enlaces de YouTube, Spotify, etc.)"
          className="mt-1 block w-full px-4 py-3 border border-marronClaro/20 rounded-xl bg-crema/50 focus:outline-none focus:ring-2 focus:ring-terracota focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-marron">
          Adjuntar imagen (opcional)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-marronClaro file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-rosaSuave file:text-terracotaIntenso hover:file:bg-terracota/20 transition"
        />
        {mediaFile && (
          <p className="text-sm text-menta mt-1">📎 {mediaFile.name}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={subiendo}
        className="w-full py-3 bg-gradient-to-r from-terracota to-terracotaIntenso hover:shadow-lg text-white font-medium rounded-xl transition duration-200 transform hover:scale-[1.01] disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {subiendo ? "Enviando..." : "📨 Enviar carta"}
      </button>
    </form>
  );
};

export default AportacionForm;
