'use client'

import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Crown, Lock } from 'lucide-react'

interface PremiumBlockProps {
  feature: string
  description?: string
  className?: string
}

export function PremiumBlock({ feature, description, className = '' }: PremiumBlockProps) {
  const router = useRouter()

  return (
    <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 text-center ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-yellow-100 rounded-full p-4">
          <Lock className="text-yellow-600" size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {feature} es una funcionalidad Premium
          </h3>
          {description && (
            <p className="text-sm text-gray-600 mb-4">
              {description}
            </p>
          )}
        </div>
        <Button
          onClick={() => router.push('/premium')}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-semibold"
        >
          <Crown className="mr-2" size={18} />
          Actualizar a Premium
        </Button>
      </div>
    </div>
  )
}

