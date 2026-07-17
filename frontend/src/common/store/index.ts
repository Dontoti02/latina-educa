import { defineStore } from 'pinia'
import { SessionStoreModel } from './model'
import cookiesService from '@/common/services/cookies'

export const SessionStore = defineStore('session', {
  state: (): SessionStoreModel => ({
    token: cookiesService.get('token'),
    user: cookiesService.getObject('user'),
    menu: cookiesService.getObject('menu') || [],
    roles: cookiesService.getObject('roles') || [],
    current_role: +cookiesService.getObject('current_role'),
    system_parameters: cookiesService.getObject('system_parameters')
  }),
  actions: {
    set(session: SessionStoreModel) {
      const { token, user, menu, roles, current_role, system_parameters } =
        session
      this.token = token
      this.user = user
      this.roles = roles
      this.menu = menu
      this.current_role = current_role
      this.system_parameters = system_parameters

      cookiesService.set('token', token)
      cookiesService.set('user', user)
      cookiesService.set('roles', roles)
      cookiesService.set('menu', menu)
      cookiesService.set('current_role', `${current_role}`)
      cookiesService.set('system_parameters', system_parameters)
    },
    get(): SessionStoreModel {
      return {
        token: this.token,
        user: this.user,
        roles: this.roles,
        menu: this.menu,
        current_role: this.current_role,
        system_parameters: this.system_parameters
      }
    },
    remove() {
      ;(this.token = null), (this.user = null), (this.roles = [])
      this.menu = []
      this.current_role = 0
      cookiesService.set('token', null)
      cookiesService.set('user', null)
      cookiesService.set('roles', [])
      cookiesService.set('modules', [])
      cookiesService.set('current_role', '0')
    },
    isLoggedIn() {
      return this.token !== null && this.user !== null
    }
  }
})

export const DrawerStore = defineStore('drawer', {
  state: () => ({
    drawer: true
  }),
  actions: {
    collapse() {
      this.drawer = !this.drawer
    }
  }
})
