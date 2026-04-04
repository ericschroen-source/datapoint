import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

export default function Login() {
  const { login, loading, error, user } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('sarah@meridian.io')
  const [password, setPassword] = useState('demo')

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <circle cx="4" cy="10" r="2" fill="white"/>
              <circle cx="7" cy="6" r="2" fill="white" opacity="0.7"/>
              <circle cx="10" cy="3" r="2" fill="white" opacity="0.4"/>
            </svg>
          </span>
          <span className="text-white font-semibold">datapoint</span>
        </div>

        <div>
          {/* Mini dashboard preview */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-zinc-500 mb-1">MRR</p>
                <p className="text-2xl font-bold text-white">$124,800</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                ↑ 12.3%
              </span>
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-12">
              {[40, 45, 48, 51, 53, 56, 57, 59, 61, 63, 64, 67].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${i === 11 ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <blockquote>
            <p className="text-zinc-300 text-lg font-medium leading-relaxed mb-4">
              "Datapoint is the first thing I open every morning. It tells me exactly what I need to know in 30 seconds."
            </p>
            <footer className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold flex items-center justify-center">SC</span>
              <div>
                <p className="text-sm font-medium text-white">Sarah Chen</p>
                <p className="text-xs text-zinc-500">CEO, Meridian Labs</p>
              </div>
            </footer>
          </blockquote>
        </div>

        <p className="text-xs text-zinc-600">© 2025 Datapoint, Inc.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="4" cy="10" r="2" fill="white"/>
                <circle cx="7" cy="6" r="2" fill="white" opacity="0.7"/>
                <circle cx="10" cy="3" r="2" fill="white" opacity="0.4"/>
              </svg>
            </span>
            <span className="font-semibold text-zinc-900">datapoint</span>
          </div>

          <h1 className="text-2xl font-semibold text-zinc-900 mb-1">Welcome back</h1>
          <p className="text-sm text-zinc-400 mb-8">Sign in to your workspace</p>

          {error && (
            <div className="mb-5 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-700">Password</label>
                <a href="#" className="text-xs text-indigo-600 hover:underline">Forgot password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-400">
            Demo credentials are pre-filled. Just hit Sign in.
          </p>
        </div>
      </div>
    </div>
  )
}
