export function getVisibleQueryFields<Field>(
  fields: Field[],
  expanded: boolean,
  collapsedCount: number
) {
  if (expanded) {
    return fields
  }

  return fields.slice(0, Math.max(0, collapsedCount))
}
