import React from 'react';
import { motion } from 'motion/react';
import { UserPlus, LogIn } from 'lucide-react';

interface WelcomeScreenProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onQuickDemo?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onOpenLogin,
  onOpenRegister,
}) => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 text-slate-800 dark:text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        {/* Brand Name */}
        <div className="space-y-4">
          <h1 className="text-6xl sm:text-8xl font-light tracking-[0.2em] text-white uppercase cursor-default">
            APLYFY
          </h1>
          <p className="text-lg sm:text-xl text-slate-200 font-medium max-w-xl mx-auto leading-relaxed cursor-default">
            Procesador de textos simple, rápido y elegante.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6 max-w-md mx-auto">
          {/* Button 1: Iniciar Sesión */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            onClick={onOpenLogin}
            className="w-full sm:w-1/2 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-900 text-white font-semibold border border-slate-600/50 backdrop-blur-2xl transition-colors group cursor-pointer"
          >
            <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Iniciar Sesión</span>
          </motion.button>

          {/* Button 2: Registrarse */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            onClick={onOpenRegister}
            className="w-full sm:w-1/2 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-semibold border border-orange-400/60 backdrop-blur-2xl transition-colors group cursor-pointer"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform text-white" />
            <span>Registrarse</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
