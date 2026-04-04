import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockApi } from '@/lib/mockApi'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const user = await mockApi.login(email, password)
          set({ user, loading: false })
        } catch (err) {
          set({ error: err.message, loading: false })
        }
      },

      logout: () => set({ user: null, error: null }),
    }),
    { name: 'datapoint-auth' }
  )
)
