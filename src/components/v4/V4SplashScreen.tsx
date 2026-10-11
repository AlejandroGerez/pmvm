'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOGO = '/images/ale/ag_loader.png'

// Logo con un brillo verde lima que lo cruza (shimmer)
function Logo() {
  const mask = {
    WebkitMaskImage: `url(${LOGO})`,
    maskImage: `url(${LOGO})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
  } as const

  return (
    <motion.div
      className="relative z-10 w-[min(50vw,260px)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <img src={LOGO} alt="Ale Gerez" className="w-full h-auto block" />
      <motion.div
        className="absolute inset-0"
        style={{
          ...mask,
          background: 'linear-gradient(110deg, transparent 35%, rgba(193,237,0,0.95) 50%, transparent 65%)',
          backgroundSize: '250% 100%',
        }}
        initial={{ backgroundPositionX: '120%' }}
        animate={{ backgroundPositionX: '-20%' }}
        transition={{ duration: 1.3, ease: 'easeInOut', delay: 0.6 }}
      />
    </motion.div>
  )
}

function V4Splash({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const t = setTimeout(onFinish, 2200)
    return () => clearTimeout(t)
  }, [onFinish])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0e0e0e]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Radial glow */}
      <motion.div
        className="absolute w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(193,237,0,0.10) 0%, transparent 70%)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.4, 1.1], opacity: [0, 1, 0.5] }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />

      {/* Ring 1 */}
      <motion.div
        className="absolute w-28 h-28 border-2 rounded-full"
        style={{ borderColor: 'rgba(193,237,0,0.35)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1, 2.8], opacity: [0, 0.8, 0] }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.25 }}
      />

      {/* Ring 2 */}
      <motion.div
        className="absolute w-28 h-28 border rounded-full"
        style={{ borderColor: 'rgba(193,237,0,0.15)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1, 4], opacity: [0, 0.5, 0] }}
        transition={{ duration: 1.8, ease: 'easeOut', delay: 0.35 }}
      />

      <Logo />

      {/* Loading bar */}
      <motion.div
        className="absolute bottom-14 w-20 h-[2px] bg-white/8 overflow-hidden rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="h-full bg-[#c1ed00] rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.2 }}
        />
      </motion.div>
    </motion.div>
  )
}

export default function V4SplashManager({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Solo mostrar una vez por pestaña
    if (sessionStorage.getItem('r3set_splash')) {
      setShowSplash(false)
    }
  }, [])

  const handleFinish = () => {
    sessionStorage.setItem('r3set_splash', '1')
    setShowSplash(false)
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <V4Splash key="v4splash" onFinish={handleFinish} />}
      </AnimatePresence>
      <div style={{ visibility: showSplash ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </>
  )
}
