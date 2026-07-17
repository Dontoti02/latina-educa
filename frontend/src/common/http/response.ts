
// export type ResponseApi<T> = {
//   data: T
//   message: string
//   success:boolean
// }


export interface ResponseData<T> {
  data: T
  message: string
  success:boolean
}
