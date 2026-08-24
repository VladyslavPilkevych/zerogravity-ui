export type ControlDef =
    | {
          kind: "number"
          path: string
          label: string
          min: number
          max: number
          step: number
          unit?: string
      }
    | {
          kind: "cssLength"
          path: string
          label: string
          min: number
          max: number
          step: number
          unit: string
      }
    | { kind: "select"; path: string; label: string; options: readonly string[] }
    | { kind: "text"; path: string; label: string; maxLength?: number; placeholder?: string }
    | { kind: "boolean"; path: string; label: string }
    | { kind: "color"; path: string; label: string }
    | { kind: "colorNullable"; path: string; label: string }
    | { kind: "palette"; path: string; label: string }

export interface ControlGroup {
    id: string
    title: string
    hint: string
    open: boolean
    controls: ControlDef[]
}

export type ChangeHandler = (path: string, value: unknown) => void

export interface PanelPreset {
    id: string
    label: string
    hint: string
}
