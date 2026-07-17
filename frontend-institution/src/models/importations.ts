export interface ImportationType {
  id: number
  key: string
  title: string
  last_date: string | null
  showButton:boolean
}

export interface CurrentImport {
  id: number
  key: string
  title: string
  status: string
  progress: number
  date: string
  time_elapsed: number
  log: string[]
  summary: any
}

export interface ImportResult {
  id: number
  key: string
  title: string
  status: string
  progress: number
  date: string
  time_elapsed: number
  log: string[]
  summary: any
}

export interface ImportHistory {
  id: number
  key: string
  title: string
  details: Detail[]
}

export interface Detail {
  id: number
  status: string
  date: string
  log: string[]
}
