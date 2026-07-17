import { createRouter, createWebHistory } from 'vue-router'
import { SessionStore } from './store'

const router = createRouter({
  history: createWebHistory('/'),
  strict: true,
  routes: [
    {
      path: '/',
      name: 'App',
      meta: { requiresAuth: true },
      component: () => import('@/modules/app/pages/Scaffold.vue'),
      children: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/modules/home/pages/Index.vue'),
        },

      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/modules/auth/pages/Login.vue'),
    },
    {
      path: '/:pathMatch(.*)',
      redirect: { name: 'Home' },
    },
  ],
})

const defaultPath = 'Dashboard'
const commonPaths = []

router.beforeEach((to, _, next) => {
  const redirect = (): { path: string } | { name: string } | null => {
    const loggingIn = to.name === 'Login'
    const sessionStore = SessionStore()
    const loggedIn = sessionStore.isLoggedIn()
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    if (requiresAuth) {
      if (!loggedIn)
        return { name: 'Login' }

      const goingToACommonPath = commonPaths.includes(to.name)
      if (goingToACommonPath)
        return null

      const modules = sessionStore.modules!

      if (modules.length > 0) {
        const hasPathAccess = modules.some(m =>
          m.options.some(o => o.nameUrl === to.name),
        )

        if (hasPathAccess)
          return null

        if (to.name === defaultPath)
          return null

        return { name: defaultPath }
      }

      setTimeout(() => window.alert('You do no have enought permissions'))

      return { name: 'SignOut' }
    }

    if (loggingIn && loggedIn)
      return { name: defaultPath }

    return null
  }

  const location = redirect()

  if (location !== null)
    next(location)
  else
    next()
})

export default router
