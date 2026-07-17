export type PaginationFilters =  {
    search? : string | null,
    page?: number,
    items? : number
    sort? : Sort[]
}

export type Pagination =  {
    page: number,
    pages: number,
    total:number,
}

export type Sort =  {
    column : string
    direction : SortDirection,
    priority : number
}

export type SortDirection = 'ASC' | 'DESC'
