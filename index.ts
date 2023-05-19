function getAll<T extends object> (...objects: T[]) {
  const all: Record<string, Array<unknown>> = {}
  let rep: Record<string, number> = {}
  let index = 0

  function init (n: number, key: string) {
    all[key] = []
    for (let i = 0; i < n; i++) {
      all[key].push('null')
    }
  }

  function traverse (object: T, parent = '') {
    for (const key in object) {
      rep[key] === undefined ? rep[key] = 0 : rep[key]++
      const repKey = key + (rep[key] > 0 ? `_${parent}` : '')
      const value = object[key]
      if (typeof value === 'object') {
        traverse(value as T, key)
      } else {
        if (all[repKey]) {
          all[repKey][index] = value
        } else {
          init(objects.length, repKey)
          all[repKey][index] = value
        }
      }
    }
  }

  for (const object of objects) {
    rep = {}
    traverse(object)
    index++
  }

  return all
}

function convertToCSV (data: Record<string, Array<unknown>>): string {
  let csv = ''
  for (const key in data) {
    csv += `${key},`
  }
  csv = csv.slice(0, -1)
  csv += '\n'
  const max = Math.max(...Object.values(data).map((v) => v.length))
  for (let i = 0; i < max; i++) {
    for (const key in data) {
      csv += `${data[key][i] as string},`
    }
    csv = csv.slice(0, -1)
    csv += '\n'
  }
  return csv
}
