/// <reference types="vite/client" />

// Déclarations pour les imports de fichiers de polices
declare module '*.ttf?url' {
  const url: string
  export default url
}

declare module '*.ttf' {
  const url: string
  export default url
}

declare module '*.woff' {
  const url: string
  export default url
}

declare module '*.woff2' {
  const url: string
  export default url
}
