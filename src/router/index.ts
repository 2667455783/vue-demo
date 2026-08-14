import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import Layout from '@/layout/index.vue'

/**
 * 必须共用同一个 Layout 父路由：若 `/`、`/system` 各挂一份 Layout，
 * 跨模块切换会销毁并重建侧栏/顶栏，菜单点击会明显卡顿。
 */
export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { hidden: true },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'system/user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'system/menu',
        name: 'Menu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: { title: '菜单管理' },
      },
      {
        path: 'system/role',
        name: 'Role',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: { hidden: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
})

const whiteList = ['/login', '/404']

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  if (userStore.token && to.path === '/login') {
    next('/')
    return
  }

  if (userStore.token) {
    if (!permissionStore.loaded) {
      try {
        await userStore.fetchUserInfo()
        await permissionStore.fetchMenus()
        next({ path: to.path, query: to.query, replace: true })
      } catch {
        userStore.logout()
        permissionStore.resetMenus()
        next(`/login?redirect=${to.path}`)
      }
      return
    }

    // 路由级菜单鉴权：无权限进 404（白名单与 Layout 根除外）
    if (
      !whiteList.includes(to.path) &&
      to.path !== '/' &&
      !permissionStore.canAccessPath(to.path)
    ) {
      next('/404')
      return
    }

    next()
    return
  }

  if (whiteList.includes(to.path)) {
    next()
  } else {
    next(`/login?redirect=${to.path}`)
  }
})

router.afterEach((to) => {
  NProgress.done()
  const title = (to.meta.title as string) || ''
  const appTitle = import.meta.env.VITE_APP_TITLE || '通用后台管理系统'
  document.title = title ? `${title} - ${appTitle}` : appTitle
})

export default router
