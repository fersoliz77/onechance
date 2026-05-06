/**
 * Exporta un array de objetos como archivo CSV descargable.
 * Implementación client-side pura — sin dependencias externas.
 */
export function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0])
  const escape = (v: unknown): string => {
    const str = v == null ? '' : String(v).replace(/"/g, '""')
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str
  }

  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
