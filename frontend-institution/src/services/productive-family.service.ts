import http from "@/common/http";
import type {
  ProductiveFamilyItem,
  ProductiveFamilyListResponse,
  RequestParamsProductiveFamily,
} from "@/models/productive-family";

export class ProductiveFamilyService {
  static async getList(body: RequestParamsProductiveFamily) {
    return await http.post<ProductiveFamilyListResponse>(
      "/tenant/productive_family/list",
      body,
    );
  }

  static async create(body: Pick<ProductiveFamilyItem, "name">) {
    return await http.post<ProductiveFamilyItem>(
      "/tenant/productive_family/create",
      body,
    );
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/productive_family/delete/${id}`);
  }

  static async update(id: number, body: Pick<ProductiveFamilyItem, "name">) {
    return await http.put<ProductiveFamilyItem>(
      `/tenant/productive_family/update/${id}`,
      body,
    );
  }
}
