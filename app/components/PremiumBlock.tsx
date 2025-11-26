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
    <div className={`bg-[linear-gradient(135deg,#F8D77E,#F2C94C_40%,#D6A63A)] border-2 border-[#D6A63A] rounded-xl p-6 text-center ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white/30 rounded-full p-4 backdrop-blur-sm">
          <Lock className="text-white" size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-2">
            {feature} es una funcionalidad Premium
          </h3>
          {description && (
            <p className="text-sm text-white/95 mb-4">
              {description}
            </p>
          )}
        </div>
        <Button
          onClick={() => router.push('/premium')}
          className="bg-white text-[#D6A63A] hover:bg-gray-100 font-semibold shadow-lg"
        >
          <Crown className="mr-2" size={18} />
          Actualizar a Premium
        </Button>
      </div>
    </div>
  )
}

