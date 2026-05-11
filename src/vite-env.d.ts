/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAPPI_AUTH?: string;
  readonly VITE_RAPPI_DEVICEID?: string;
  readonly VITE_RAPPI_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
