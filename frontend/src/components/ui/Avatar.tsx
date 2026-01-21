import type { User } from '@/lib/rbac'
import { gradientClasses } from '@/lib/gradients'
import { twMerge } from 'tailwind-merge'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

interface AvatarProps {
  user: User
  size: 'small' | 'medium' | 'large'
  gradient?: string // Optional gradient override (takes precedence over DB)
}

const Avatar = ({ user, size, gradient }: AvatarProps) => {
  const initials = user.name?.split(' ').map(name => name[0]).join('')
  
  // Fetch user preferences from database
  const userPreferences = useQuery(api.queries.users.getUserPreferences)

  const sizeClass = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  }
  const textSizeClass = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl'
  }

  // Priority: prop gradient > DB gradient > default
  const gradientClass = gradient || 
    userPreferences?.gradient ||
    gradientClasses.Dusk

  return (
    <div className={twMerge(
      `flex items-center justify-center rounded-full ${sizeClass[size]}`,
      gradientClass
    )}>
      <p className={`text-white font-medium ${textSizeClass[size]}`}>{initials}</p>
    </div>
  )
}

export default Avatar