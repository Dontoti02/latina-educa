import http from "@/common/http"
import { MasterTable, MasterTableCreateForm } from "@/models/job-opportunities/master-table";

export function useMasterService(apiBase: string) {
  const list = async () => await http.get<MasterTable[]>(apiBase);
  const create = (data: MasterTableCreateForm) => http.post<MasterTable>(apiBase, data)
  const update = (id: number, data: MasterTableCreateForm) => http.put<MasterTable>(`${apiBase}/${id}`, data)
  const remove = (id: number) => http.delete<void>(`${apiBase}/${id}`)

  return { list, create, update, remove }
}
