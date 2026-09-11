export interface ApiResponse<T> {
  code: number | string
  message: string
  data: T
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResult {
  token: string
}
