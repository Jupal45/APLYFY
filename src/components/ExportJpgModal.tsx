import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Image as ImageIcon, FileText } from 'lucide-react';
import { LiquidGlassCard } from './LiquidGlassCard';
import { downloadDataURL } from '../utils/qrHelper';

interface ExportJpgModalProps {
  isOpen: boolean;
  onClose: () => void;
  docTitle: string;
  jpgDataUrl: string | null;
  isGenerating: boolean;
}

export const ExportJpgModal: React.FC<ExportJpgModalProps> = ({
  isOpen,
  onClose,
  docTitle,
  jpgDataUrl,
  isGenerating,
}) => {
  if (!isOpen) return null;

  const fileName = `${docTitle.trim() || 'documento'}.jpg`;

  const handleDownload = () => {
    if (!jpgDataUrl) return;
    downloadDataURL(jpgDataUrl, fileName);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-3xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg my-auto"
        >
          <LiquidGlassCard glowColor="orange" className="p-5 sm:p-7 text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-400/40">
                  <ImageIcon className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-bold text-white">
                    Vista Previa de Exportación (JPG)
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Title Badge */}
            <div className="flex justify-center mb-3">
              <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 text-xs text-orange-300 font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-400" />
                {fileName}
              </span>
            </div>

            {/* Vertical JPG Preview Frame (Vertical Orientation) */}
            <div className="relative my-3 rounded-2xl bg-slate-900/90 border-2 border-white/20 p-2 sm:p-3 shadow-2xl overflow-hidden flex items-center justify-center min-h-[380px] max-h-[60vh] mx-auto w-full max-w-sm">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center space-y-3 py-16 text-slate-400">
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold">Cargando vista previa...</p>
                </div>
              ) : jpgDataUrl ? (
                <div className="w-full h-full overflow-y-auto rounded-xl bg-white p-2 border border-slate-300 shadow-inner flex justify-center">
                  <img
                    src={jpgDataUrl}
                    alt="Vista Previa Vertical JPG"
                    className="w-full h-auto object-contain mx-auto rounded shadow-sm border border-slate-200 aspect-[1/1.41]"
                  />
                </div>
              ) : (
                <div className="text-slate-400 text-xs font-semibold py-12">
                  No se pudo cargar la vista previa.
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDownload}
                disabled={!jpgDataUrl || isGenerating}
                className="flex-1 py-3 px-6 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs shadow-xl border border-orange-400/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Imagen JPG</span>
              </button>
            </div>
          </LiquidGlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
