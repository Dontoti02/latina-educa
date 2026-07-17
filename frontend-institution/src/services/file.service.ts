import http from '@/common/http'
import type { UploadFileDto } from '@/models/file'

export class FileService {
  static async downloadFile(uuid: string) {
    return await http.getBlob(`/tenant/file/download/${uuid}`)
  }

  static async uploadFile(args: UploadFileDto) {
    return await http.postFormData('/tenant/file/upload', args)
  }

  static async deleteFile(model: UploadFileDto['model'], fileId: number) {
    return await http.delete(`/tenant/file/delete/${fileId}/${model}`)
  }
}
