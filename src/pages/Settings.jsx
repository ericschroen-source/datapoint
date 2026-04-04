import { useState } from 'react'
import { useCompany } from '@/hooks/useCompany'
import TopBar from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'

function Section({ title, desc, children }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100">
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        {desc && <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function Field({ label, value, hint }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-700 mb-1.5">{label}</label>
      <input
        defaultValue={value}
        className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
      {hint && <p className="mt-1.5 text-xs text-zinc-400">{hint}</p>}
    </div>
  )
}

export default function Settings() {
  const { company, features, loading } = useCompany()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading || !company) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <TopBar title="Settings" subtitle="Workspace & integrations" />

      <main className="flex-1 overflow-auto px-6 py-6 space-y-4 max-w-2xl">

        <Section title="Workspace" desc="Your company details and preferences">
          <div className="space-y-4">
            <Field label="Company name" value={company.name} />
            <Field label="Domain" value={company.domain} hint="Used to verify team member email addresses." />
            <Field label="Industry" value={company.industry} />
            <div className="pt-2">
              <Button
                onClick={handleSave}
                className={`h-9 px-5 text-sm font-medium transition-all ${
                  saved
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {saved ? '✓ Saved' : 'Save changes'}
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Integrations" desc="Connect your data sources to power your dashboards">
          <div className="space-y-3">
            {features.map((f) => (
              <div key={f.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold ${
                    f.connected ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-zinc-50 text-zinc-400'
                  }`}>
                    {f.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{f.name}</p>
                    <p className="text-xs text-zinc-400">
                      {f.connected
                        ? `Synced ${new Date(f.lastSync).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                        : f.category}
                    </p>
                  </div>
                </div>
                <Button
                  variant={f.connected ? 'outline' : 'default'}
                  size="sm"
                  className={`h-8 px-3 text-xs ${
                    f.connected
                      ? 'border-zinc-200 text-zinc-500 hover:border-rose-200 hover:text-rose-600'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {f.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Plan" desc="You're on the Enterprise plan">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900 capitalize">{company.plan}</p>
              <p className="text-xs text-zinc-400 mt-0.5">Unlimited dashboards · SSO · Priority support</p>
            </div>
            <Button variant="outline" size="sm" className="h-9 px-4 border-zinc-200 text-zinc-600 text-sm">
              Manage plan
            </Button>
          </div>
        </Section>

        <Section title="Danger zone">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900">Delete workspace</p>
              <p className="text-xs text-zinc-400 mt-0.5">This action is permanent and cannot be undone.</p>
            </div>
            <Button variant="outline" size="sm" className="h-9 px-4 border-rose-200 text-rose-600 hover:bg-rose-50 text-sm">
              Delete
            </Button>
          </div>
        </Section>

      </main>
    </>
  )
}
