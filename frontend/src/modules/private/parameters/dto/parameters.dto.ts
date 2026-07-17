export type ParameterDto = {
  key: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'date' | 'file'
  value: ParameterType
}

export type ParametersFormDto = {
  [key: string]: ParameterDto
}


export type ParameterType  =  string
| number
| boolean
| string[]
| number[]
| null
| Array<any>
| Object
| File
| any

export type SystemParameters = {
  app_name: string | null
  favicon: string | null
  logo: string | null
  banner: string | null
  institution_name: string | null
  last_date: string
}
