export interface User {
  id: string
  username: string
  email?: string
  password: string
  role: 'ADMIN' | 'USER'
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  title: string
  icon?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Link {
  id: string
  title: string
  url: string
  logo?: string
  description?: string
  tags?: string[]
  categoryId: string
  order: number
  deprecated?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FriendLink {
  id: string
  title: string
  url: string
  logo?: string
  description?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateCategoryDto {
  title: string
  icon?: string
  order?: number
}

export interface UpdateCategoryDto {
  title?: string
  icon?: string
  order?: number
}

export interface CreateLinkDto {
  title: string
  url: string
  logo?: string
  description?: string
  tags?: string[]
  categoryId: string
  order?: number
  deprecated?: boolean
}

export interface UpdateLinkDto {
  title?: string
  url?: string
  logo?: string
  description?: string
  tags?: string[]
  categoryId?: string
  order?: number
  deprecated?: boolean
}

export interface CreateUserDto {
  username: string
  email?: string
  password: string
  role?: 'ADMIN' | 'USER'
}

export interface LoginDto {
  username: string
  password: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: Omit<User, 'password'>
    token: string
  }
  message?: string
}

export interface SiteConfig {
  id: string
  name: string
  description: string
  keywords: string
  author: string
  authorLink: string
  url: string
  logo: string
  icon: string
  icp: string
  defaultLocale: string
  env: string
  createdAt: Date
  updatedAt: Date
}

export interface UpdateSiteConfigDto {
  name?: string
  description?: string
  keywords?: string
  author?: string
  authorLink?: string
  url?: string
  logo?: string
  icon?: string
  icp?: string
  defaultLocale?: string
  env?: string
}

export interface CreateFriendLinkDto {
  title: string
  url: string
  logo?: string
  description?: string
  order?: number
}

export interface UpdateFriendLinkDto {
  title?: string
  url?: string
  logo?: string
  description?: string
  order?: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// 友链申请相关类型
export interface FriendLinkSubmission {
  id: string
  title: string
  url: string
  logo?: string
  description?: string
  contact?: string
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateFriendLinkSubmissionDto {
  title: string
  url: string
  logo?: string
  description?: string
  contact?: string
}

export interface UpdateFriendLinkSubmissionDto {
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
}

// 导航站申请相关类型
export interface LinkSubmission {
  id: string
  title: string
  url: string
  logo?: string
  description?: string
  categoryId?: string
  tags?: string[]
  contact?: string
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateLinkSubmissionDto {
  title: string
  url: string
  logo?: string
  description?: string
  categoryId?: string
  tags?: string[]
  contact?: string
}

export interface UpdateLinkSubmissionDto {
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
}
