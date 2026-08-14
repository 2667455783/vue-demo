import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginApi, getUserInfoApi } from '@/api/auth'
import type { LoginParams, UserInfo } from '@/api/auth'
import { TOKEN_KEY } from '@/constants/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref<UserInfo | null>(null)
  const nickname = ref('')

  function setToken(t: string) {
    token.value = t
    localStorage.setItem(TOKEN_KEY, t)
  }

  async function login(params: LoginParams) {
    const res = await loginApi(params)
    setToken(res.token)
  }

  async function fetchUserInfo() {
    const res = await getUserInfoApi()
    userInfo.value = res
    nickname.value = res.nickname
    return res
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    nickname.value = ''
    localStorage.removeItem(TOKEN_KEY)
  }

  return {
    token,
    userInfo,
    nickname,
    setToken,
    login,
    fetchUserInfo,
    logout,
  }
})
