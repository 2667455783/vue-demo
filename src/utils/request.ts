import axios from 'axios'
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { mockRequest } from '@/mock'
import { TOKEN_KEY } from '@/constants/auth'

export interface ApiResult<T = unknown> {
  code: number
  data: T
  message: string
}

const service = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

let handling401 = false

async function handleUnauthorized() {
  if (handling401) return
  handling401 = true
  try {
    const { useUserStore } = await import('@/stores/user')
    const { usePermissionStore } = await import('@/stores/permission')
    const router = (await import('@/router')).default
    useUserStore().logout()
    usePermissionStore().resetMenus()
    const redirect = router.currentRoute.value.path
    if (redirect !== '/login') {
      await router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
    }
  } finally {
    handling401 = false
  }
}

function isUnauthorized(code?: number, httpStatus?: number) {
  return code === 401 || httpStatus === 401
}

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResult
    if (res.code !== undefined && res.code !== 0 && res.code !== 200) {
      if (isUnauthorized(res.code)) {
        ElMessage.error(res.message || '登录已失效')
        void handleUnauthorized()
      } else {
        ElMessage.error(res.message || '请求失败')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res as unknown as typeof response
  },
  (error) => {
    if (isUnauthorized(undefined, error.response?.status)) {
      ElMessage.error('登录已失效')
      void handleUnauthorized()
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  },
)

export function assertBusinessCode(res: { code?: number; message?: string }) {
  if (res.code !== undefined && res.code !== 0 && res.code !== 200) {
    if (isUnauthorized(res.code)) {
      ElMessage.error(res.message || '登录已失效')
      void handleUnauthorized()
    } else {
      ElMessage.error(res.message || '请求失败')
    }
    throw new Error(res.message || '请求失败')
  }
  return res
}

async function requestWithMock<T>(
  method: string,
  url: string,
  data?: unknown,
  params?: Record<string, unknown>,
): Promise<T> {
  const config: AxiosRequestConfig = { method, url, data, params }
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers = { Authorization: `Bearer ${token}` }
  }

  const mockRes = await mockRequest(config)
  if (mockRes) {
    const res = mockRes.data as ApiResult
    assertBusinessCode(res)
    return res.data as T
  }

  const res = (await service({ method, url, data, params })) as unknown as ApiResult<T>
  return res.data
}

const request = {
  get<T = unknown>(url: string, config?: { params?: Record<string, unknown> }) {
    return requestWithMock<T>('GET', url, undefined, config?.params)
  },
  post<T = unknown>(url: string, data?: unknown) {
    return requestWithMock<T>('POST', url, data)
  },
}

export default request
