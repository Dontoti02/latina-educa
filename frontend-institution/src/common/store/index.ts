import { defineStore } from 'pinia'
import { RoleTrainingEnum, type SessionStoreModel } from './model'
import cookiesService from '@/common/services/cookies'
import { RolEnum } from '../enum/rol.enum'

export const SessionStore = defineStore('session', {
  state: (): SessionStoreModel => ({
    token: cookiesService.get('token'),
    user: cookiesService.getObject('user'),
    modules: cookiesService.getObject('modules') || [],
    roles: cookiesService.getObject('roles') || [],
    academicPeriod: cookiesService.getObject('academicPeriod'),
    changingRole: false,
    systemConfiguration: cookiesService.getObject('systemConfiguration'),
    userAbilities : localStorage.getItem('userAbilities') ? JSON.parse(localStorage.getItem('userAbilities')!) : [],
  }),
  actions: {
    set(session: SessionStoreModel) {
      const { token, user, modules, roles, academicPeriod, systemConfiguration } = session

      this.token = token
      this.user = user
      this.roles = roles
      this.modules = modules
      this.academicPeriod = academicPeriod
      this.systemConfiguration = systemConfiguration
      cookiesService.set('token', token)
      cookiesService.set('user', user)
      cookiesService.set('roles', roles)
      cookiesService.set('modules', modules)
      cookiesService.set('academicPeriod', academicPeriod)
      cookiesService.set('systemConfiguration', systemConfiguration)

    },
    get(): SessionStoreModel {
      return {
        token: this.token,
        user: this.user,
        roles: this.roles,
        modules: this.modules,
        academicPeriod: this.academicPeriod,
        changingRole: this.changingRole,
        systemConfiguration: this.systemConfiguration,
        userAbilities: this.userAbilities,
      }
    },
    remove() {
      this.token = null
      this.user = null
      this.roles = []
      this.modules = []
      this.academicPeriod = null
      cookiesService.set('token', null)
      cookiesService.set('user', null)
      cookiesService.set('roles', [])
      cookiesService.set('modules', [])
      cookiesService.set('academicPeriod', null)
    },
    isLoggedIn() {
      return !!this.token && !!this.user && !!this.user.role.name && !!this.academicPeriod
    },
    isStudent() {
      return !!this.user && !!this.user.role && this.user.role.name === 'ESTUDIANTE'
    },
    isTeacher() {
      return !!this.user && !!this.user.role && this.user.role.name === 'DOCENTE'
    },
    isSecretary() {
      return !!this.user && !!this.user.role && this.user.role.name === 'SECRETARIO ACADÉMICO'
    },
    isAdmin() {
      return !!this.user && !!this.user.role && this.user.role.name === 'ADMINISTRADOR'
    },
    isTrainingAdmin(){
      return !!this.user && !!this.user.role && this.user.role.id === RoleTrainingEnum.COORDINATOR
    },
    isTrainingTeacher(){
      return !!this.user && !!this.user.role && this.user.role.id === RoleTrainingEnum.TEACHER
    },
    isTrainingStudent(){
      return !!this.user && !!this.user.role && this.user.role.id === RoleTrainingEnum.STUDENT
    },
    toggleChangingRole() {
      this.changingRole = !this.changingRole
    },
    isCompany() {
      return !!this.user && !!this.user.role && this.user.role.id === RolEnum.COMPANY_ID
    }
  },
})
