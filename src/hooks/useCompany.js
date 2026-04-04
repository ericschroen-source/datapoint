import { useEffect } from 'react'
import { useCompanyStore } from '@/stores/companyStore'

export function useCompany() {
  const { company, users, features, loading, fetchAll } = useCompanyStore()

  useEffect(() => {
    if (!company) fetchAll()
  }, [company, fetchAll])

  return { company, users, features, loading }
}
