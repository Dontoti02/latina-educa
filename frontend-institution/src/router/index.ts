import { canNavigate } from '@/@layouts/plugins/casl'
import { SessionStore } from '@/common/store'
import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: to => {
        const session = SessionStore()

        if (session.user && session.user.role)
          return { name: 'welcome-home' }

        session.remove()

        return { name: 'login', query: to.query }
      },
    },
    ...setupLayouts(routes),
  ],
})

router.beforeEach(to => {
  const session = SessionStore()

  const isLoggedIn = session.isLoggedIn()

  const hasAbilityAccess = canNavigate(to)

  let hasModuleAccess = false
  if (isLoggedIn && session.modules && session.modules.length > 0) {
    const routeSubject = to.meta.subject as string | undefined
    if (routeSubject) {
      hasModuleAccess = session.modules.some(m =>
        m.options && m.options.some(o => o.nameUrl === routeSubject || o.name_url === routeSubject),
      )
    }
    if (!hasModuleAccess && !routeSubject) {
      hasModuleAccess = true
    }
  }

  if (hasAbilityAccess || hasModuleAccess) {
    if (to.meta.redirectIfLoggedIn && isLoggedIn)
      return '/'
  }
  else {
    if (isLoggedIn) {
      return { name: 'not-authorized' }
    }
    else {
      session.remove()

      return {
        name: 'login',
        query: { to: to.name !== 'index' ? to.fullPath : undefined },
      }
    }
  }
})

export default router
