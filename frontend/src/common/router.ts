import { createRouter, createWebHistory } from 'vue-router'
import { SessionStore } from './store'
import { OptionDTO } from '@/modules/auth/dto'

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
          path: '/home',
          name: 'Home',
          component: () => import('@/modules/private/home/ui/Index.vue')
        },
        {
          path: 'institutions',
          children: [
            {
              path: '',
              name: 'Institution',
              component: () =>
                import('@/modules/private/institution/ui/Index.vue')
            },
            {
              path: 'management/:id',
              name: 'managementInstitution',
              component: () =>
                import('@/modules/private/institution/ui/management/Index.vue')
            }
          ]
        },
        {
          path: '/parameters',
          name: 'Parameters',
          component: () => import('@/modules/private/parameters/ui/Index.vue')
        },
        {
          path: '/users',
          name: 'Users',
          component: () => import('@/modules/private/users/ui/Index.vue')
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('@/modules/private/profile/ui/Index.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/modules/auth/pages/Login.vue')
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('@/modules/auth/pages/ForgotPassword.vue')
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: () => import('@/modules/auth/pages/ResetPassword.vue')
    },
    {
      path: '/:pathMatch(.*)',
      redirect: { name: 'Home' }
    }
  ]
})

// const defaultPath = 'Dashboard'
const defaultPath = 'Institution'
const commonPaths = ['managementInstitution']

router.beforeEach((to, _, next) => {
  const redirect = (): { path: string } | { name: string } | null => {
    const loggingIn = to.name === 'Login'
    const sessionStore = SessionStore()
    const loggedIn = sessionStore.isLoggedIn()
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    if (requiresAuth) {
      if (!loggedIn) {
        return { name: 'Login' }
      }

      const goingToACommonPath = commonPaths.some((path) => path === to.name)
      if (goingToACommonPath) {
        return null
      }

      const modules = sessionStore.menu!

      const options: OptionDTO[] = []

      modules.forEach((item) => {
        options.push(...item.options)
      })
      const optionsOneLevel = flattenOptions(options)

      // if (modules.length > 0) {
      if (optionsOneLevel.length > 0) {
        // const hasPathAccess = modules.some((m) =>
        //   m.options.some((o) => o.url === to.name)
        // )

        const hasPathAccess = optionsOneLevel.some(
          (o) => o.name_url === to.name
        )

        if (hasPathAccess) return null

        if (to.name === defaultPath) return null

        return { name: defaultPath }
      }

      setTimeout(() => window.alert('You do no have enought permissions'))
      return { name: 'SignOut' }
    }

    if (loggingIn && loggedIn) return { name: defaultPath }

    return null
  }

  const location = redirect()

  if (location !== null) {
    next(location)
  } else {
    next()
  }
})

function flattenOptions(options: OptionDTO[], flatOptions: OptionDTO[] = []) {
  for (const option of options) {
    flatOptions.push(option)
    if (option.options && option.options.length > 0) {
      flattenOptions(option.options, flatOptions)
    }
  }
  return flatOptions
}

export default router
