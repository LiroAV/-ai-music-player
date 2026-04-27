export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface ApiError {
  statusCode: number
  message: string
  error: string
}

export interface ApiSuccess<T = void> {
  success: true
  data: T
}
