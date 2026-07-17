// 👉 IsEmpty
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') return true

  return !!(Array.isArray(value) && value.length === 0)
}

// 👉 IsNullOrUndefined
export const isNullOrUndefined = (
  value: unknown
): value is undefined | null => {
  return value === null || value === undefined
}

// 👉 IsEmptyArray
export const isEmptyArray = (arr: unknown): boolean => {
  return Array.isArray(arr) && arr.length === 0
}

// 👉 IsObject
export const isObject = (obj: unknown): obj is Record<string, unknown> =>
  obj !== null && !!obj && typeof obj === 'object' && !Array.isArray(obj)

export const isToday = (date: Date) => {
  const today = new Date()

  return (
    /* eslint-disable operator-linebreak */
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
    /* eslint-enable */
  )
}

// 👉 Required Validator
export const requiredValidator = (value: unknown) => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return 'Este campo es requerido'

  return !!String(value).trim().length || 'Este campo es requerido'
}

// 👉 Email Validator
export const emailValidator = (value: unknown) => {
  if (isEmpty(value)) return true

  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  if (Array.isArray(value)) {
    return (
      value.every((val) => re.test(String(val))) || 'El email debe ser válido'
    )
  }

  return re.test(String(value)) || 'El email debe ser válido'
}

// 👉 Password Validator
export const passwordValidator = (password: string) => {
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/

  const validPassword = regExp.test(password)

  return (
    // eslint-disable-next-line operator-linebreak
    validPassword ||
    'El campo debe contener al menos una mayúscula, una minúscula, un carácter especial y un dígito con un mínimo de 8 caracteres'
  )
}

// 👉 Confirm Password Validator
export const confirmedValidator = (value: string, target: string) =>
  value === target || 'The Confirm Password field confirmation does not match'

// 👉 Between Validator
export const betweenValidator = (value: unknown, min: number, max: number) => {
  const valueAsNumber = Number(value)

  // Cambiar a español
  return (
    (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber) ||
    `Ingrese un número entre ${min} y ${max}`
  )
}

// 👉 Integer Validator
export const integerValidator = (value: unknown) => {
  if (isEmpty(value)) return true

  if (Array.isArray(value)) {
    return (
      value.every((val) => /^-?[0-9]+$/.test(String(val))) ||
      'Este campo debe ser un entero'
    )
  }

  return /^-?[0-9]+$/.test(String(value)) || 'Este campo debe ser un entero'
}

// 👉 Regex Validator
export const regexValidator = (
  value: unknown,
  regex: RegExp | string
): string | boolean => {
  if (isEmpty(value)) return true

  let regeX = regex
  if (typeof regeX === 'string') regeX = new RegExp(regeX)

  if (Array.isArray(value))
    return value.every((val) => regexValidator(val, regeX))

  return regeX.test(String(value)) || 'El formato del campo regex no es válido'
}

// 👉 Alpha Validator
export const alphaValidator = (value: unknown) => {
  if (isEmpty(value)) return true

  return (
    /^[A-Z]*$/i.test(String(value)) ||
    'El campo Alfa sólo puede contener caracteres alfabéticos'
  )
}

// 👉 URL Validator
export const urlValidator = (value: unknown) => {
  if (isEmpty(value)) return true

  const re =
    /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}[.]{0,1}/

  return re.test(String(value)) || 'La URL no es válida'
}

// 👉 Length Validator
export const lengthValidator = (value: unknown, length: number) => {
  if (isEmpty(value)) return true

  return (
    String(value).length === length ||
    `El campo debe tener al menos ${length} caracteres`
  )
}

// 👉 Min Length Validator
export const minLengthValidator = (value: unknown, length: number) => {
  if (isEmpty(value)) return true

  return (
    String(value).length >= length ||
    `El campo debe tener al menos ${length} caracteres`
  )
}

// 👉 Max Length Validator
export const maxLengthValidator = (value: unknown, length: number) => {
  if (isEmpty(value)) return true

  return (
    String(value).length <= length ||
    `El campo debe tener como máximo ${length} caracteres`
  )
}

// 👉 Alpha-dash Validator
export const alphaDashValidator = (value: unknown) => {
  if (isEmpty(value)) return true

  const valueAsString = String(value)

  return (
    /^[0-9A-Z_-]*$/i.test(valueAsString) ||
    'Todos los caracteres no son válidos'
  )
}
