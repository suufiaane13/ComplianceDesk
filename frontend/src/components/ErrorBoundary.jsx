import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-slate-950">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Une erreur est survenue</h1>
          <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
            L’interface a rencontré un problème inattendu. Rechargez la page pour continuer.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Recharger
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
