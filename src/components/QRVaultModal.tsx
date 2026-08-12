import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Download, Copy, Check, FileJson, ShieldCheck } from 'lucide-react';
import { LiquidGlassCard } from './LiquidGlassCard';
import { UserAccount } from '../types';
import { downloadDataURL, downloadFile, encodeUserVault } from '../utils/qrHelper';

interface QRVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount;
  qrDataUrl: string;
}

export const QRVaultModal: React.FC<QRVaultModalProps> = ({
  isOpen,
  onClose,
  account,
  qrDataUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    const rawVault = encodeUserVault(account);
    navigator.clipboard.writeText(rawVault);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const rawVault = encodeUserVault(account);
    downloadFile(`Respaldo_APLYFY_${account.name.replace(/\s+/g, '_')}.json`, rawVault, "application/json");
  };

  const handleDownloadPNG = () => {
    downloadDataURL(qrDataUrl, `CodigoQR_APLYFY_${account.name.replace(/\s+/g, '_')}.png`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-3xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg my-auto"
        >
          <LiquidGlassCard glowColor="indigo" className="p-6 sm:p-8 text-center text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-400/40">
                  <QrCode className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-base font-bold text-white">Mi Bóveda QR</h2>
                  <p className="text-[11px] text-slate-300">{account.documents.length} documento(s) sincronizado(s)</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Pill Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/80 border border-white/10 my-2">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm border border-orange-400">
                {account.name ? account.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">{account.name}</p>
                <p className="text-[10px] text-orange-300 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> Encriptado con Contraseña
                </p>
              </div>
            </div>

            {/* Hero Centered QR Image Frame */}
            <div className="my-3">
              <div className="inline-block p-4 sm:p-5 rounded-3xl bg-white shadow-2xl border-4 border-white/90 max-w-[250px] sm:max-w-[270px]">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Código QR de Acceso"
                    className="w-full h-auto rounded-xl mx-auto"
                  />
                ) : (
                  <div className="w-52 h-52 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 text-xs font-semibold">
                    Generando QR...
                  </div>
                )}
                <p className="text-[10px] text-slate-700 font-black tracking-widest uppercase text-center mt-2 pt-2 border-t border-slate-200">
                  APLYFY QR VAULT
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-medium mb-5 max-w-xs mx-auto leading-relaxed">
              Cualquier cambio que realices se actualiza automáticamente en este código de respaldo.
            </p>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleDownloadPNG}
                className="w-full py-3.5 px-4 rounded-2xl bg-orange-600/90 hover:bg-orange-500 text-white font-bold text-xs shadow-lg border border-orange-400/50 backdrop-blur-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Imagen (.png)</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleDownloadJSON}
                  className="py-3 px-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileJson className="w-4 h-4 text-orange-400" />
                  <span>Respaldo .json</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  className="py-3 px-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
