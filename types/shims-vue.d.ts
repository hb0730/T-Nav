declare module '*.svg?component' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<any>
  export default component
}

declare module '*.png' {
  const value: string
  export default value
}
