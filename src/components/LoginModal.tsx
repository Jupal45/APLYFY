import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Upload, Lock, ArrowRight, FileText, AlertCircle } from 'lucide-react';
import { LiquidGlassCard } from './LiquidGlassCard';
import { UserAccount } from '../types';
import { decodeUserVault, scanQRCodeFromImage, generateQRCodeDataURL } from '../utils/qrHelper';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (account: UserAccount, qrDataUrl: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<'upload' | 'password'>('upload');
  const [scannedAccount, setScannedAccount] = useState<UserAccount | null>(null);
  const [rawVaultText, setRawVaultText] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('upload');
      setScannedAccount(null);
      setRawVaultText('');
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  // Process decoded QR text string
  const processDecodedText = (textData: string) => {
    setIsLoading(true);
    setError('');

    const result = decodeUserVault(textData);
    if (!result.success || !result.account) {
      setError(result.error || 'Código QR o archivo no reconocido.');
      setIsLoading(false);
      return;
    }

    setScannedAccount(result.account);
    setRawVaultText(textData);
    setStep('password');
    setIsLoading(false);
  };

  // Handle QR Code Image Upload File
  const handleQRImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      if (file.name.endsWith('.json') || file.name.endsWith('.txt') || file.type.includes('json')) {
        const text = await file.text();
        processDecodedText(text);
        return;
      }

      const qrText = await scanQRCodeFromImage(file);
      processDecodedText(qrText);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'No se pudo leer el código QR de la imagen. Intenta con el archivo .json de respaldo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify password and complete login
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedAccount) return;

    if (password !== scannedAccount.passwordHash) {
      setError('Contraseña incorrecta. Por favor, verifica e inténtalo de nuevo.');
      return;
    }

    setIsLoading(true);
    try {
      const qrDataUrl = await generateQRCodeDataURL(rawVaultText);
      onLoginSuccess(scannedAccount, qrDataUrl);
    } catch (err: any) {
      console.error(err);
      setError('Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
                  <QrCode className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Iniciar Sesión</h2>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {step === 'upload' ? 'Importa tu código QR o archivo de cuenta' : 'Confirma tu contraseña'}
                  </p>
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
              <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: IMPORT QR CODE / BACKUP */}
            {step === 'upload' && (
              <div className="mt-6 space-y-6">
                {/* File Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/50 dark:border-white/30 hover:border-indigo-400 rounded-3xl p-8 text-center bg-white/20 dark:bg-slate-800/30 backdrop-blur-md cursor-pointer transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-indigo-300/40">
                    <Upload className="w-8 h-8 text-indigo-300" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Subir Imagen QR o Archivo de Cuenta
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium max-w-xs mx-auto">
                    Haz clic para seleccionar la imagen de tu Código QR (.png, .jpg) o archivo .json.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.json,.txt"
                    onChange={handleQRImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: ENTER PASSWORD */}
            {step === 'password' && scannedAccount && (
              <form onSubmit={handleVerifyPassword} className="mt-6 space-y-6">
                {/* Account Identified Card */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/30 dark:bg-slate-800/40 border border-white/40">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-400 shadow-md shrink-0 bg-slate-200">
                    {scannedAccount.profilePicUrl ? (
                      <img
                        src={scannedAccount.profilePicUrl}
                        alt={scannedAccount.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                        {scannedAccount.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {scannedAccount.name}
                    </h3>
                    <p className="text-xs text-indigo-200 font-semibold flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{scannedAccount.documents.length} documento(s) guardado(s)</span>
                    </p>
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Ingresa tu Contraseña</span>
                  </label>
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/40 dark:bg-slate-800/60 border border-white/50 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-sm transition-all"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('upload');
                      setError('');
                    }}
                    className="px-4 py-3.5 rounded-2xl bg-white/20 hover:bg-white/40 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3.5 rounded-2xl bg-orange-600/90 hover:bg-orange-500 text-white font-bold shadow-xl border border-orange-400/50 backdrop-blur-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>Entrar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </LiquidGlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

