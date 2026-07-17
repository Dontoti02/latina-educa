export interface SystemConfigurationItem {
  key: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'date' | 'file'
  value: string | number | boolean | string[] | number[] | null | Array<any>
}

export interface FormSubmit {
  key: string
  value: string | boolean | string[] | number[] | File
}

export interface SystemConfigurationForm {
  [key: string]: SystemConfigurationItem
}

export interface GeneralSystemConfiguration {
  app_name: string | null
  favicon: string | null
  logo: string | null
  banner: string | null
  institution_name: string | null
  last_date: string
  primary_color: string
  redirect_links : {
    name: string
    link : string
  } []
}
