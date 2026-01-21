import type { User } from '@/lib/rbac'

const Avatar = ({ user, size }: { user: User, size: 'small' | 'medium' | 'large' }) => {

    const initials = user.name?.split(' ').map(name => name[0]).join('')

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

  return (
    <div className={`flex items-center justify-center rounded-full bg-linear-to-r from-lime-500 via-green-500 to-emerald-500 ${sizeClass[size]}`}>
        <p className={`text-white font-medium ${textSizeClass[size]}`}>{initials}</p>
    </div>
  )
}

export default Avatar