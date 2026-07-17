import http from "@/common/http";
import type {
  ModuleTypeItem,
  ModuleTypeListResponse,
  RequestParamsModuleType,
  ModuleTypePayload,
  ModuleItem,
  ModuleListResponse,
  RequestParamsModule,
  ModulePayload,
  ModuleFormParamsResponse,
} from "@/models/modules";

export class ModuleTypeService {
  static async getList(body: RequestParamsModuleType) {
    return await http.post<ModuleTypeListResponse>(
      "/tenant/module_type/list",
      body,
    );
  }

  static async create(body: ModuleTypePayload) {
    return await http.post<ModuleTypeItem>("/tenant/module_type/create", body);
  }

  static async update(id: number, body: ModuleTypePayload) {
    return await http.put<ModuleTypeItem>(
      `/tenant/module_type/update/${id}`,
      body,
    );
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/module_type/delete/${id}`);
  }
}

export class ModuleService {
  static async getList(body: RequestParamsModule) {
    return await http.post<ModuleListResponse>("/tenant/module/list", body);
  }

  static async getFormParams() {
    return await http.get<ModuleFormParamsResponse>("/tenant/module/params");
  }

  static async create(body: ModulePayload) {
    return await http.post<ModuleItem>("/tenant/module/create", body);
  }

  static async update(id: number, body: ModulePayload) {
    return await http.put<ModuleItem>(`/tenant/module/update/${id}`, body);
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/module/delete/${id}`);
  }

  static async sort(id: number, position: 1 | -1) {
    return await http.put(`/tenant/module/sort/${id}/${position}`);
  }
}
