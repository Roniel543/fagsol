/**
 * Type definitions para FagSol
 */

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone?: string
  role: 'student' | 'teacher' | 'admin' | 'superadmin'
  avatar?: string
  bio?: string
  is_email_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface Course {
  id: number
  title: string
  slug: string
  description: string
  short_description?: string
  image?: string
  instructor: User
  level: 'beginner' | 'intermediate' | 'advanced'
  duration_hours: number
  full_price: number
  discount_percentage: number
  requirements?: string
  what_you_learn?: string
  target_audience?: string
  total_students: number
  modules_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Module {
  id: number
  course: Course | number
  title: string
  slug: string
  description: string
  order: number
  price: number
  duration_hours: number
  lessons_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: number
  module: Module | number
  title: string
  description?: string
  order: number
  content_type: 'video' | 'document' | 'link' | 'text'
  content_url: string
  content_text?: string
  duration_minutes: number
  is_free: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: number
  user: User | number
  module: Module
  payment?: number
  status: 'active' | 'completed' | 'expired'
  progress_percentage: number
  enrolled_at: string
  completed_at?: string
  expires_at?: string
}

export interface Payment {
  id: number
  user: User | number
  payment_type: 'full_course' | 'single_module' | 'multiple_modules'
  amount: number
  currency: string
  mercadopago_preference_id?: string
  mercadopago_payment_id?: string
  status: 'pending' | 'approved' | 'rejected' | 'refunded'
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: {
    message: string
    details?: Record<string, string[]>
    status_code?: number
  }
}

export interface PaginatedResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

