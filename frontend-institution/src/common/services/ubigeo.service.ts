import peru from '@/common/util/peru.json';

export class UbigeoService {
  
  static get departments() {
    return peru.departamentos.map((d) => ({
      id: d.id_ubigeo,
      name: d.nombre_ubigeo,
    }));
  }

  static get provincies() {
    const result: Record<string, Array<{ id: string; name: string }>> = {};
    Object.entries(peru.provincias).forEach(([depId, provincias]) => {
      result[depId] = provincias.map((prov: any) => ({
      id: prov.id_ubigeo,
      name: prov.nombre_ubigeo,
      }));
    });
    return result;
  }
  

}
