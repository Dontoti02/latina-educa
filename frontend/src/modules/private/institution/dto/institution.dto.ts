import { Pagination } from "@/modules/app/domain/pagination";

export type InstitutionDto = {
    id:number;
    domain:string;
    ruc:string;
    name:string;
    type_management:string;
    department:string;
    province:string;
    district:string;
    address:string;
    logo:string|null;
    is_active:boolean;
    created_at: string
}

export type InstitutionFormDto = {
    id?:string;
    modular_code : string;
    ruc:string;
    name:string;
    type_management:string;
    department:string;
    province:string;
    district:string;
    address:string;
    subdomain: string;
}

export type InstitutionPaginationDto = {
    items : InstitutionDto[],
    pagination : Pagination
}