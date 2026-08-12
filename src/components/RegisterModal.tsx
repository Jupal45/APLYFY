import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { LiquidGlassCard } from './LiquidGlassCard';
import { UserAccount } from '../types';
import { encodeUserVault, generateQRCodeDataURL } from '../utils/qrHelper';
import { createTestDocument } from '../utils/testDocument';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (account: UserAccount, qrDataUrl: string) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
}) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, ingresa tu nombre.');
      return;
    }
    if (!password) {
      setError('Por favor, ingresa una contraseña de seguridad.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const newAccount: UserAccount = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        passwordHash: password,
        profilePicUrl: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        documents: [
          createTestDocument(),
          {
            id: `doc_${Date.now()}`,
            title: 'Mi Primer Documento',
            content: '',
            plainText: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            fontFamily: 'sans-serif',
            fontSize: '16px',
            wordCount: 0,
            charCount: 0,
          },
        ],
      };

      const rawVaultString = encodeUserVault(newAccount);
      const qrDataUrl = await generateQRCodeDataURL(rawVaultString);

      onRegisterSuccess(newAccount, qrDataUrl);
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error al crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg"
        >
          <LiquidGlassCard glowColor="indigo" className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-300/40">
                  <Sparkles className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registro de Nuevo Usuario</h2>
                  <p className="text-xs text-slate-700 dark:text-slate-300">Crea tu cuenta de APLYFY</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-400" />
                  <span>Nombre Completo</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/40 dark:bg-slate-800/60 border border-white/50 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium text-sm transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-orange-400" />
                  <span>Contraseña de Seguridad</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/40 dark:bg-slate-800/60 border border-white/50 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium text-sm transition-all"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-4 rounded-2xl bg-orange-600/90 hover:bg-orange-500 text-white font-bold shadow-xl border border-orange-400/50 backdrop-blur-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span>Creando cuenta...</span>
                  ) : (
                    <>
                      <span>Crear Cuenta y Abrir APLYFY</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </LiquidGlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

