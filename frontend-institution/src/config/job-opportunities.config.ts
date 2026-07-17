export const JobOpportunitiesMasterTableConfig = {
  work_schedule: {
    title: 'Jornada Laboral',
    key: 'work_schedule',
    apiBase: '/tenant/job-opportunities/master-table/work_schedule',
  },
  category: {
    title: 'Categorías',
    key: 'category',
    apiBase: '/tenant/job-opportunities/master-table/category',
  },
  location: {
    title: 'Ubicaciones',
    key: 'location',
    apiBase: '/tenant/job-opportunities/master-table/location',
  },
  contract_type: {
    title: 'Tipos de Contrato',
    key: 'contract_type',
    apiBase: '/tenant/job-opportunities/master-table/contract_type',
  },
} as const

export type JobOpportunitiesMasterTableKey = keyof typeof JobOpportunitiesMasterTableConfig
