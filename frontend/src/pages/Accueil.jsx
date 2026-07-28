import { Link } from 'react-router-dom'
import { useAuth, homePathForUser } from '../context/AuthContext'
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  BellIcon,
  ChartBarIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CalendarIcon,
} from '../components/icons'
import Logo, { logoHoverClassName } from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

const FEATURES = [
  { Icon: ShieldCheckIcon, title: 'Suivi des obligations', desc: 'Centralisez toutes vos obligations réglementaires en un seul endroit. Statuts, échéances, catégories — tout est visible en un clin d\'œil.' },
  { Icon: DocumentTextIcon, title: 'Gestion documentaire', desc: 'Attachez contrats, attestations et certificats directement à chaque obligation. Téléchargez-les à tout moment.' },
  { Icon: BellIcon, title: 'Notifications intelligentes', desc: 'Soyez alerté avant chaque échéance. Les notifications vous préviennent quand un document expire ou qu\'une échéance approche.' },
  { Icon: ChartBarIcon, title: 'Tableau de bord clair', desc: 'Taux de conformité, obligations à venir, documents expirés — visualisez tout en temps réel depuis votre tableau de bord.' },
  { Icon: UserIcon, title: 'Gestion d\'équipe', desc: 'Invitez vos collaborateurs, gérez les rôles et partagez la charge de conformité au sein de votre entreprise.' },
  { Icon: CalendarIcon, title: 'Dates d\'échéance', desc: 'Définissez des dates limites pour chaque obligation et suivez leur statut automatiquement : à jour, proche de l\'échéance, ou expirée.' },
]

const STEPS = [
  { num: '1', title: 'Connectez-vous', desc: 'Votre administrateur crée votre compte entreprise.' },
  { num: '2', title: 'Ajoutez vos obligations', desc: 'Saisissez vos obligations et assignez des catégories.' },
  { num: '3', title: 'Joignez vos documents', desc: 'Téléversez contrats, attestations et certificats.' },
  { num: '4', title: 'Suivez et gérez', desc: 'Visualisez le statut et recevez des alertes.' },
]

const TESTIMONIALS = [
  { name: 'Fatima Zahra', role: 'Responsable Qualité', text: 'ComplianceDesk a transformé notre façon de gérer la conformité. Plus rien ne nous échappe.' },
  { name: 'Youssef El Idrissi', role: 'DAF', text: 'Les notifications avant échéance nous ont évité plusieurs pénalités. Un outil indispensable.' },
  { name: 'Amina Benali', role: 'Juriste', text: 'Interface intuitive et claire. Je recommande à toutes les PME marocaines.' },
]

export default function Accueil() {
  const { user } = useAuth()
  const home = homePathForUser(user)

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-slate-950">
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="group flex shrink-0 items-center gap-3 rounded-xl">
            <Logo className={`relative h-10 w-10 shrink-0 ${logoHoverClassName}`} />
            <div>
              <p className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">ComplianceDesk</p>
              <p className="hidden text-xs font-medium text-teal-700 dark:text-teal-400 sm:block">Maroc · Conformité PME</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link to={home} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-teal-900/20 transition hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700">
                Mon espace <ArrowRightIcon className="h-4 w-4" />
              </Link>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-teal-900/20 transition hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700">
                Se connecter <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute -left-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-1.5 text-xs font-semibold text-teal-300">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                Simplifiez votre conformité
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                Gérez vos obligations <br />
                <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">en toute sérénité</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                ComplianceDesk centralise toutes vos obligations réglementaires, documents et échéances dans une plateforme simple et intuitive.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to={user ? home : '/login'} className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-teal-50">
                  {user ? 'Accéder à mon espace' : 'Se connecter'}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <a href="#features" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
                  Découvrir les fonctionnalités
                </a>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl shadow-black/20 backdrop-blur-sm">
                <div className="rounded-xl bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">ComplianceDesk</span>
                  </div>
                  <div className="mt-5 grid grid-cols-4 gap-3">
                    {[
                      { label: 'Total', value: '24', color: 'text-white' },
                      { label: 'À jour', value: '18', color: 'text-emerald-400' },
                      { label: 'Proches', value: '4', color: 'text-amber-400' },
                      { label: 'Expirées', value: '2', color: 'text-red-400' },
                    ].map((k) => (
                      <div key={k.label} className="rounded-lg bg-white/5 p-3 text-center ring-1 ring-white/5">
                        <p className={`text-xl font-extrabold ${k.color}`}>{k.value}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{k.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg bg-white/5 p-3 ring-1 ring-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Taux de conformité</span>
                      <span className="text-xs font-extrabold text-teal-400">75%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      { name: 'Déclaration TVA', status: 'À jour', statusColor: 'text-emerald-400 bg-emerald-400/10' },
                      { name: 'CNSS trimestre', status: 'Proche', statusColor: 'text-amber-400 bg-amber-400/10' },
                      { name: 'Assurance RC', status: 'Expirée', statusColor: 'text-red-400 bg-red-400/10' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5 ring-1 ring-white/5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10">
                            <DocumentTextIcon className="h-3.5 w-3.5 text-slate-300" />
                          </div>
                          <span className="text-xs font-medium text-slate-200">{item.name}</span>
                        </div>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${item.statusColor}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:px-6">
          {[
            { value: '100%', label: 'Gratuit' },
            { value: '∞', label: 'Obligations' },
            { value: '∞', label: 'Documents' },
            { value: '24/7', label: 'Accès' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-teal-700 dark:text-teal-400">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">Fonctionnalités</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">Tout ce dont vous avez besoin</h2>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Une suite complète pour gérer la conformité de votre entreprise.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 transition hover:border-teal-200 hover:shadow-xl hover:shadow-teal-100/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-teal-700 dark:hover:shadow-teal-900/20">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal-50 transition group-hover:scale-150 group-hover:bg-teal-100/60 dark:bg-teal-900/20 dark:group-hover:bg-teal-900/40" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-900/40 dark:text-teal-400">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="relative mt-5 text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">Processus</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">Comment ça marche ?</h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Quatre étapes simples pour démarrer.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ num, title, desc }, i) => (
              <div key={num} className="relative text-center">
                {i < STEPS.length - 1 && <div className="absolute left-1/2 top-6 hidden h-0.5 w-full bg-teal-100 dark:bg-teal-900 lg:block" />}
                <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 text-lg font-extrabold text-white shadow-lg shadow-teal-200 dark:shadow-teal-900/40">
                  {num}
                </span>
                <h3 className="mt-5 text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">Témoignages</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">Ce que disent nos utilisateurs</h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map(({ name, role, text }) => (
              <div key={name} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-sm font-extrabold text-white">
                    {name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">"{text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-teal-900 p-10 text-center sm:p-16">
            <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-emerald-300/15 blur-3xl" />
            <h2 className="relative text-2xl font-extrabold text-white sm:text-3xl">Prêt à simplifier votre conformité ?</h2>
            <p className="relative mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
              Rejoignez les entreprises qui font confiance à ComplianceDesk pour gérer leurs obligations.
            </p>
            <div className="relative mt-8">
              <Link to={user ? home : '/login'} className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-teal-50">
                {user ? 'Accéder à mon espace' : 'Se connecter'}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">ComplianceDesk</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">&copy; {new Date().getFullYear()} ComplianceDesk. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
