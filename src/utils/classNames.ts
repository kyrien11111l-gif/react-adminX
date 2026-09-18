export type ClassNameValue = string | false | null | undefined

export function joinClassNames(...values: ClassNameValue[]) {
  return values.filter(Boolean).join(' ')
}
