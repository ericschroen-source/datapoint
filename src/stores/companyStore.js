import { create } from 'zustand'
import { mockApi } from '@/lib/mockApi'

export const useCompanyStore = create((set) => ({
  company: null,
  metrics: null,
  users: [],
  features: [],
  reports: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true })
    const [company, metrics, users, features, reports] = await Promise.all([
      mockApi.getCompany(),
      mockApi.getMetrics(),
      mockApi.getUsers(),
      mockApi.getFeatures(),
      mockApi.getReports(),
    ])
    set({ company, metrics, users, features, reports, loading: false })
  },
}))
