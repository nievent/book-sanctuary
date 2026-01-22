"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Book, Sparkles, Mail, Lock, User, ArrowRight } from "lucide-react"
import { signIn, signUp } from "@/app/actions/auth"
import { toast } from "sonner"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    try {
      if (isLogin) {
        const result = await signIn(formData)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("¡Bienvenido de vuelta! 📚")
        }
      } else {
        const result = await signUp(formData)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("¡Cuenta creada! Revisa tu email para confirmar 📧")
        }
      }
    } catch (error) {
      toast.error("Algo salió mal. Inténtalo de nuevo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Hero */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-12 flex-col justify-between relative overflow-hidden"
      >
        {/* Elementos decorativos flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[10, 25, 40, 55, 70, 85, 15, 35, 60, 80, 20, 50, 75, 30, 65, 45, 90, 5, 95, 12].map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${pos}%`,
                top: `${(i * 13) % 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="flex items-center gap-3 text-white"
          >
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Book className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold">Book Sanctuary</span>
          </motion.div>
        </div>

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-bold text-white mb-6 leading-tight"
          >
            Tu refugio literario
            <br />
            <span className="text-white/80">personal</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-white/90 leading-relaxed"
          >
            Organiza tu biblioteca, trackea tu progreso,
            y descubre tu próxima gran lectura.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-8 text-white/90 relative z-10"
        >
          <div>
            <div className="text-3xl font-bold">1000+</div>
            <div className="text-sm">Libros organizados</div>
          </div>
          <div>
            <div className="text-3xl font-bold">500+</div>
            <div className="text-sm">Lectores activos</div>
          </div>
          <div>
            <div className="text-3xl font-bold">50+</div>
            <div className="text-sm">Reseñas diarias</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Panel derecho - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo móvil */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <Book className="w-8 h-8 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Book Sanctuary
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? "¡Bienvenido de vuelta!" : "Crea tu cuenta"}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? "Continúa tu viaje literario"
                : "Comienza tu aventura de lectura"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                isLogin
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                !isLogin
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Form */}
          <form action={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Tu nombre"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">Recuérdame</span>
                </label>
                <button
                  type="button"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                "Cargando..."
              ) : (
                <>
                  {isLogin ? "Entrar" : "Crear cuenta"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600">
            {isLogin ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-purple-600 font-medium hover:text-purple-700"
                >
                  Regístrate gratis
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-purple-600 font-medium hover:text-purple-700"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}