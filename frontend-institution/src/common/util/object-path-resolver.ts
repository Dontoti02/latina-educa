export class ObjectPathResolver {
  /**
   * Retrieves the value from an object at a specific path.
   *
   * @param {unknown} obj - The object from which to retrieve the value.
   * @param {string} path - The path of properties in the object. Properties should be separated by periods.
   * @returns {unknown | null} - Returns the value at the specified path if it exists, otherwise returns null.
   *
   * @example
   * const obj = { a: { b: { c: 5 } } };
   * console.log(getValue(obj, 'a.b.c')); // Outputs: 5
   * console.log(getValue(obj, 'a.b.x')); // Outputs: null
   */
  static getValue(obj: unknown, path: string): unknown | null {
    if (typeof obj !== 'object' || obj === null) {
      return null
    }

    const properties = path.split('.')

    function recursiveAccess(obj: any, properties: string[]): unknown | null {
      if (properties.length === 0) {
        return obj
      }

      const currentProperty = properties[0]
      const remainingProperties = properties.slice(1)

      if (typeof obj === 'object' && obj !== null && currentProperty in obj) {
        return recursiveAccess(
          (obj as { [index: string]: unknown })[currentProperty],
          remainingProperties
        )
      }

      return null
    }

    return recursiveAccess(obj, properties)
  }
}
