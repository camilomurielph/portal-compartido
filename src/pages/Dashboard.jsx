import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAportaciones } from '../hooks/useAportaciones'
import { supabase } from '../lib/supabase'
import AportacionForm from '../components/AportacionForm'
import AportacionList from '../components/AportacionList'
import Contador from '../components/Contador'
import ProximoDesbloqueo from '../components/ProximoDesbloqueo'

// Lista de apodos cariñosos (se irán rotando diariamente)
const APODOS = [
  "amor de mi vida",
  "amore mio",
  "mi cielito",
  "mi princesa",
  "mi pedacito de paz",
  "mi amor hermosa",
  "mi tesoro",
  "mi vida",
  "mi sol",
  "mi luna"
]

/**
 * Obtiene el día del año (1-365/366)
 */
const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

/**
 * Selecciona un apodo según el día del año
 * Así es consistente para ambos usuarios (mismo día = mismo apodo)
 */
const getApodoDelDia = () => {
  const hoy = new Date()
  const dayOfYear = getDayOfYear(hoy)
  const index = dayOfYear % APODOS.length
  return APODOS[index]
}

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const { aportaciones, loading, desbloqueado, crearAportacion, fetchAportaciones } = useAportaciones()
  const [fechaReencuentro, setFechaReencuentro] = useState(null)
  const [saludo, setSaludo] = useState('')
  const [apodo, setApodo] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const getFechaReencuentro = async () => {
      const { data, error } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', 'fecha_reencuentro')
        .maybeSingle()

      if (!error && data) {
        setFechaReencuentro(data.valor)
      } else {
        setFechaReencuentro('2026-09-27T20:00:00Z')
      }
    }
    getFechaReencuentro()

    // Saludo según la hora local
    const hora = new Date().getHours()
    if (hora < 12) setSaludo('Buenos días')
    else if (hora < 18) setSaludo('Buenas tardes')
    else setSaludo('Buenas noches')

    // Apodo del día
    setApodo(getApodoDelDia())

    // Opcional: si quieres que cambie a medianoche sin recargar
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 0)
    const timeToMidnight = midnight - new Date()
    const timer = setTimeout(() => {
      setApodo(getApodoDelDia())
    }, timeToMidnight)

    return () => clearTimeout(timer)
  }, [])

  // GUARDAR AUTOMÁTICAMENTE EN LECTURAS CUANDO SE DESBLOQUEAN CARTAS DEL OTRO
  useEffect(() => {
    const guardarLecturas = async () => {
      if (!user || !desbloqueado || aportaciones.length === 0) return

      const cartasDelOtro = aportaciones.filter(a => a.autor_id !== user.id)
      if (cartasDelOtro.length === 0) return

      for (const carta of cartasDelOtro) {
        const { data: existe } = await supabase
          .from('lecturas')
          .select('id')
          .eq('usuario_id', user.id)
          .eq('carta_id', carta.id)
          .maybeSingle()

        if (!existe) {
          await supabase
            .from('lecturas')
            .insert({ usuario_id: user.id, carta_id: carta.id })
        }
      }
    }

    guardarLecturas()
  }, [aportaciones, desbloqueado, user])

  return (
    <div className="min-h-screen bg-crema p-4 relative">
      <div className="absolute inset-0 bg-dots pointer-events-none" />
      
      <div className="relative max-w-lg mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="glass-card rounded-3xl p-5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracota to-terracotaIntenso flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
              🦉
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-marron">
                {saludo}, {apodo} ✨
              </h1>
              <p className="text-xs text-marronClaro">Tu buzón de cartas</p>
            </div>
            <button
              onClick={signOut}
              className="px-3 py-1 bg-rosaSuave hover:bg-terracota/30 text-marron rounded-full text-xs font-medium transition-all border border-terracota/20 flex items-center gap-1"
            >
              🚪
            </button>
          </div>
        </div>

        {/* Contadores */}
        <div className="flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-6 text-center border border-terracota/10">
            <div className="flex items-center justify-center gap-2 text-marronClaro mb-1">
              <span className="text-2xl">📅</span>
              <span className="text-sm font-medium">El día que nos reencontramos</span>
            </div>
            {fechaReencuentro ? (
              <Contador fechaObjetivo={fechaReencuentro} />
            ) : (
              <p className="text-marronClaro">Cargando...</p>
            )}
          </div>
          
          <div className="glass-card rounded-3xl p-6 border border-terracota/10">
            <div className="flex items-center justify-center gap-2 text-marronClaro mb-1">
              <span className="text-2xl">🦉</span>
              <span className="text-sm font-medium">Enviando cartas</span>
            </div>
            <ProximoDesbloqueo desbloqueado={desbloqueado} />
          </div>
        </div>

        {/* Botón Nueva Carta */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full py-4 bg-gradient-to-r from-terracota to-terracotaIntenso hover:shadow-lg text-white font-bold rounded-2xl transition duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 text-lg"
        >
          ✉️ {showForm ? 'Cerrar' : 'Nueva carta'}
        </button>

        {/* Formulario (condicional) */}
        {showForm && (
          <div className="animate-fadeIn">
            <AportacionForm 
              onCreate={async (contenido, mediaFile) => {
                await crearAportacion(contenido, mediaFile)
                setShowForm(false)
                await fetchAportaciones()
              }} 
            />
          </div>
        )}

        {/* Lista de Cartas */}
        <AportacionList
          aportaciones={aportaciones}
          desbloqueado={desbloqueado}
          loading={loading}
          onRefresh={fetchAportaciones}
        />

        {/* Footer */}
        <div className="mt-6 text-center text-marronClaro/60 text-xs">
          <span className="inline-flex items-center gap-1">
            Hecho con ❤️ para ti
          </span>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
