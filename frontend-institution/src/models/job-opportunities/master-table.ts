export type MasterTable = {
  id: number
  name: string
  description: string | null
  createdAt: string
}


export type MasterTableCreateForm = {
  name: string
  description?: string | null
}
