import request from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  roleIds: number[]
}

export function loginApi(data: LoginParams) {
  return request.post<LoginResult>('/auth/login', data)
}

export function getUserInfoApi() {
  return request.get<UserInfo>('/auth/userinfo')
}
