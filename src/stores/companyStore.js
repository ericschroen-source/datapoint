import { create } from 'zustand'
import { mockApi } from '@/lib/mockApi'

export const useCompanyStore = create((set) => ({
  company: null,
  metrics: null,
  users: [],
  features: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true })
    const [company, metrics, users, features] = await Promise.all([
      mockApi.getCompany(),
      mockApi.getMetrics(),
      mockApi.getUsers(),
      mockApi.getFeatures(),
    ])
    set({ company, metrics, users, features, loading: false })
  },
}))
