import { Environment } from '@/common/services/environment'

export class ImageUtils {
  static getUrlImage(imageDisk: string): string {
    const serverUrl = Environment.serverUrl.replace(/\/api$/, '')
    return `${serverUrl}/storage/${imageDisk}`
  }
}
