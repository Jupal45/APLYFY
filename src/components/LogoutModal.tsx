import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Download, FileJson, ShieldCheck, Sparkles, X } from 'lucide-react';
import { LiquidGlassCard } from './LiquidGlassCard';
import { UserAccount } from '../types';
import { downloadDataURL, downloadFile, encodeUserVault } from '../utils/qrHelper';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  account: UserAccount;
  qrDataUrl: string;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  account,
  qrDataUrl,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const totalWords = account.documents.reduce((acc, d) => acc + d.wordCount, 0);

  const handleDownloadPNG = () => {
    downloadDataURL(qrDataUrl, `APLYFY_Final_QR_${account.name.replace(/\s+/g, '_')}.png`);
    setDownloaded(true);
  };

  const handleDownloadJSON = () => {
    const rawVault = encodeUserVault(account);
    downloadFile(`APLYFY_Respaldo_Final_${account.name.replace(/\s+/g, '_')}.json`, rawVault, "application/json");
    setDownloaded(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-3xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl my-auto"
        >
          <LiquidGlassCard glowColor="indigo" className="p-6 sm:p-8 text-center text-white">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-200 font-bold text-xs mb-3 backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Código QR Final de Respaldo</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
              Cierre de Sesión
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto leading-relaxed">
              Guarda tu código QR para restaurar tu cuenta (<span className="font-bold text-orange-300">{account.name}</span>) con sus <span className="font-bold text-orange-300">{account.documents.length} documento(s)</span>.
            </p>

            {/* User Pill Info */}
            <div className="my-4 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/80 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm border border-orange-400">
                {account.name ? account.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">{account.name}</p>
                <p className="text-[10px] text-orange-300 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> Respaldo Listo ({totalWords} palabras)
                </p>
              </div>
            </div>

            {/* Hero Centered QR Display Frame */}
            <div className="my-2">
              <div className="inline-block p-4 sm:p-5 rounded-3xl bg-white shadow-2xl border-4 border-white/90 max-w-[260px] sm:max-w-[280px]">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Código QR Final de Cierre de Sesión"
                    className="w-full h-auto rounded-xl mx-auto"
                  />
                ) : (
                  <div className="w-56 h-56 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 text-xs font-semibold">
                    Generando QR...
                  </div>
                )}
                <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px] text-slate-700 font-black tracking-widest uppercase text-center">
                  APLYFY MASTER QR
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-medium mt-2 mb-6 max-w-sm mx-auto">
              💡 Para ingresar de nuevo, haz clic en "Iniciar Sesión", selecciona esta imagen QR e ingresa tu contraseña.
            </p>

            {/* Download Buttons Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleDownloadPNG}
                className="py-3.5 px-4 rounded-2xl bg-orange-600/90 hover:bg-orange-500 text-white font-bold text-xs shadow-lg border border-orange-400/50 backdrop-blur-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Guardar Imagen (.png)</span>
              </button>

              <button
                onClick={handleDownloadJSON}
                className="py-3.5 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs border border-white/20 backdrop-blur-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-orange-400" />
                <span>Guardar Respaldo (.json)</span>
              </button>
            </div>

            {/* Confirm Logout & Exit Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmLogout}
                className="flex-1 py-3 px-5 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs shadow-lg border border-rose-400/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Confirmar y Finalizar Sesión</span>
              </button>
            </div>
          </LiquidGlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
