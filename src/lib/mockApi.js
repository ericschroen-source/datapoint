import users from '@/data/users.json'
import metricsData from '@/data/metrics.json'
import companyData from '@/data/company.json'
import featuresData from '@/data/features.json'

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

export const mockApi = {
  async login(email, password) {
    await delay()
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid email or password')
    return user
  },

  async getCompany() {
    await delay(200)
    return companyData
  },

  async getMetrics() {
    await delay(300)
    return metricsData
  },

  async getUsers() {
    await delay(200)
    return users
  },

  async getFeatures() {
    await delay(200)
    return featuresData
  },
}
