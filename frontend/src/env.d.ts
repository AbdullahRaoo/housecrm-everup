/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_HOST: string
  readonly VITE_API_PORT: string
  readonly VITE_BACKEND_URL: string
  readonly VITE_APP_HOST: string
  readonly VITE_APP_PORT: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}