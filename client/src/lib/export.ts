/**
 * Utility to export data as a CSV file.
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 */
export function downloadCsv<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export'
) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','), // Header row
    ...data.map((row) =>
      headers
        .map((fieldName) => {
          const value = row[fieldName]
          const escaped = ('' + (value ?? '')).replace(/"/g, '""')
          return `"${escaped}"`
        })
        .join(',')
    ),
  ]

  const csvString = csvRows.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
