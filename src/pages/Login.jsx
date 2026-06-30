import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rosaSuave to-crema p-4">
      <div className="max-w-md w-full bg-blancoRoto rounded-2xl shadow-xl p-8 border border-terracota/20">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">🦉</span>
          <h1 className="text-3xl font-bold text-marron">Bienvenid@</h1>
          <p className="text-marronClaro mt-1">
            Inicia sesión para leer tus cartas
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-marron">
              Usuario
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              className="mt-1 block w-full px-4 py-2 border border-marronClaro/30 rounded-lg bg-crema/50 focus:outline-none focus:ring-2 focus:ring-terracota focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-marron">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-1 block w-full px-4 py-2 border border-marronClaro/30 rounded-lg bg-crema/50 focus:outline-none focus:ring-2 focus:ring-terracota focus:border-transparent transition"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-terracota hover:bg-terracotaIntenso text-white font-medium rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>
        <p className="text-xs text-center text-marronClaro mt-6">
          ✧ Buzón de amor ✧
        </p>
      </div>
    </div>
  );
};

export default Login;
