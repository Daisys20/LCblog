/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_TARGET?: string;
  readonly VITE_TENANT_ID?: string;
  readonly VITE_SITE_TITLE?: string;
  readonly VITE_SITE_TAGLINE?: string;
  readonly VITE_SITE_DESCRIPTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
