import type { Attendance } from '@/models/attendance'
import type { Emitter } from 'mitt'
import mitt from 'mitt'

class CapacitationMenuDrawerService {
  static emitter: Emitter<any> = mitt()

  // Se registra un evento
  public static on(eventName: string, handler: (payload?: any) => void): void {
    this.emitter.on(eventName, handler)
  }

  // Se emiten diferentes eventos al objetivo
  public static emitOpenDrawer(body: { date: string; training_id: number }): void {
    this.emitter.emit('openDrawer', body)
  }

  public static emitLoadList(body: { date: string; training_id: number }): void {
    this.emitter.emit('loadList', body)
  }

  public static emitCreateList(body: { list: Attendance[]; date: string,training_id:number }): void {
    this.emitter.emit('createList', body)
  }

  public static emitUpdatedList(): void {
    this.emitter.emit('updatedList')
  }
}

export default CapacitationMenuDrawerService
