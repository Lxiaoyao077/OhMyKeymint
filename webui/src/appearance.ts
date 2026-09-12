import { setThemeMode } from 'miuix-vue'

type ResolvedMode = 'light' | 'dark'
type AppearanceListener = () => void

interface AccentPalette {
  primary: string
  onPrimary: string
  primaryContainer: string
  onPrimaryContainer: string
}

const ACCENT_PROPERTIES = [
  '--m-color-primary',
  '--m-color-on-primary',
  '--m-color-primary-container',
  '--m-color-on-primary-container',
  '--m-color-secondary',
  '--m-color-on-secondary',
  '--m-color-secondary-container',
  '--m-color-on-secondary-container',
  '--m-color-tertiary-container',
  '--m-color-on-tertiary-container',
  '--m-color-tertiary-container-variant',
  '--m-color-inverse-primary',
] as const

// The WebUI follows the system light/dark mode with a fixed palette; there is
// no Monet dynamic-color sampling and no appearance settings.
const PALETTES: Record<ResolvedMode, AccentPalette> = {
  light: {
    primary: '#3482ff',
    onPrimary: '#ffffff',
    primaryContainer: '#5d9bff',
    onPrimaryContainer: '#ffffff',
  },
  dark: {
    primary: '#277af7',
    onPrimary: '#ffffff',
    primaryContainer: '#338fe4',
    onPrimaryContainer: '#ffffff',
  },
}

export class AppearanceController {
  #systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
  #listeners: AppearanceListener[] = []

  constructor() {
    this.#systemTheme.addEventListener('change', () => {
      this.#apply()
      this.#emit()
    })
    this.#apply()
  }

  get mode(): 'auto' {
    return 'auto'
  }

  onChange(listener: AppearanceListener): () => void {
    this.#listeners.push(listener)
    return () => {
      const index = this.#listeners.indexOf(listener)
      if (index !== -1) this.#listeners.splice(index, 1)
    }
  }

  #apply(): void {
    const root = document.documentElement
    const resolved: ResolvedMode = this.#systemTheme.matches ? 'dark' : 'light'
    setThemeMode('system')
    root.style.colorScheme = resolved

    const palette = PALETTES[resolved]
    const values: Record<(typeof ACCENT_PROPERTIES)[number], string> = {
      '--m-color-primary': palette.primary,
      '--m-color-on-primary': palette.onPrimary,
      '--m-color-primary-container': palette.primaryContainer,
      '--m-color-on-primary-container': palette.onPrimaryContainer,
      '--m-color-secondary': palette.primary,
      '--m-color-on-secondary': palette.onPrimary,
      '--m-color-secondary-container': palette.primaryContainer,
      '--m-color-on-secondary-container': palette.onPrimaryContainer,
      '--m-color-tertiary-container': palette.primaryContainer,
      '--m-color-on-tertiary-container': palette.onPrimaryContainer,
      '--m-color-tertiary-container-variant': palette.primaryContainer,
      '--m-color-inverse-primary': palette.primary,
    }
    for (const [property, value] of Object.entries(values)) root.style.setProperty(property, value)
  }

  #emit(): void {
    for (const listener of this.#listeners) listener()
  }
}

export const appearance = new AppearanceController()
