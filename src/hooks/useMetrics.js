import { useEffect } from 'react'
import { useCompanyStore } from '@/stores/companyStore'

export function useMetrics() {
  const { metrics, loading, fetchAll } = useCompanyStore()

  useEffect(() => {
    if (!metrics) fetchAll()
  }, [metrics, fetchAll])

  return { metrics, loading }
}
