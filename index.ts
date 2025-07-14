/**
 * Object to CSV Recursive Converter
 * 
 * This module provides utilities to convert multiple objects into CSV format by recursively
 * flattening nested object structures and creating a tabular representation suitable for CSV export.
 * 
 * @fileoverview Utilities for converting objects to CSV format with recursive property flattening
 * @author Furiza31
 * @version 1.0.0
 */

/**
 * Recursively flattens multiple objects into a structure suitable for CSV conversion.
 * 
 * This function takes a variable number of objects and creates a flattened representation
 * where nested object properties are extracted to the top level. When multiple objects
 * contain the same property name, duplicate keys are handled by appending the parent
 * property name as a suffix.
 * 
 * @template T - The type of objects to process, must extend object
 * @param {...T[]} objects - Variable number of objects to flatten and combine
 * 
 * @returns {Record<string, Array<unknown>>} A record where each key represents a flattened
 *   property path and each value is an array containing the property values from all input objects
 * 
 * @example
 * ```typescript
 * const obj1 = { name: "John", age: 30, address: { city: "NYC", country: "USA" } };
 * const obj2 = { name: "Jane", age: 25, address: { city: "LA", country: "USA" } };
 * 
 * const result = getAll(obj1, obj2);
 * // Result: {
 * //   name: ["John", "Jane"],
 * //   age: [30, 25],
 * //   city: ["NYC", "LA"],
 * //   country: ["USA", "USA"]
 * // }
 * ```
 * 
 * @example
 * ```typescript
 * // Handling duplicate property names with parent context
 * const obj1 = { id: 1, user: { id: 101, name: "John" } };
 * const obj2 = { id: 2, user: { id: 102, name: "Jane" } };
 * 
 * const result = getAll(obj1, obj2);
 * // Result: {
 * //   id: [1, 2],
 * //   id_user: [101, 102],
 * //   name: ["John", "Jane"]
 * // }
 * ```
 */
function getAll<T extends object> (...objects: T[]) {
  const all: Record<string, Array<unknown>> = {}
  let rep: Record<string, number> = {}
  let index = 0

  /**
   * Initializes an array for a given key with 'null' values.
   * 
   * @param {number} n - The number of null values to initialize
   * @param {string} key - The property key to initialize
   */
  function init (n: number, key: string) {
    all[key] = []
    for (let i = 0; i < n; i++) {
      all[key].push('null')
    }
  }

  /**
   * Recursively traverses an object and flattens its properties.
   * 
   * This function handles nested objects by recursively calling itself,
   * and manages duplicate property names by appending the parent key name.
   * 
   * @param {T} object - The object to traverse
   * @param {string} parent - The parent property name for handling duplicates (default: '')
   */
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

/**
 * Converts a flattened data structure to CSV format string.
 * 
 * This function takes the output from the `getAll` function and converts it into
 * a properly formatted CSV string with headers in the first row and data rows following.
 * The CSV format uses comma separation and handles values by converting them to strings.
 * 
 * @param {Record<string, Array<unknown>>} data - The flattened data structure where
 *   keys are column headers and values are arrays of row data
 * 
 * @returns {string} A CSV formatted string with headers and data rows
 * 
 * @example
 * ```typescript
 * const data = {
 *   name: ["John", "Jane"],
 *   age: [30, 25],
 *   city: ["NYC", "LA"]
 * };
 * 
 * const csv = convertToCSV(data);
 * // Result:
 * // "name,age,city
 * // John,30,NYC
 * // Jane,25,LA"
 * ```
 * 
 * @example
 * ```typescript
 * // Complete workflow example
 * const obj1 = { name: "Alice", score: 95 };
 * const obj2 = { name: "Bob", score: 87 };
 * 
 * const flattened = getAll(obj1, obj2);
 * const csvOutput = convertToCSV(flattened);
 * console.log(csvOutput);
 * // Output:
 * // name,score
 * // Alice,95
 * // Bob,87
 * ```
 */
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
