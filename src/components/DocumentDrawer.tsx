import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  Plus,
  Search,
  Trash2,
  Copy,
  Edit2,
  Download,
  Calendar,
  Sparkles,
  Check,
  TestTube,
} from 'lucide-react';
import { Document } from '../types';
import { generateDocumentJpg } from '../utils/exportJpg';
import { downloadDataURL } from '../utils/qrHelper';
import { downloadFile } from '../utils/qrHelper';

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  onCreateNewDoc: () => void;
  onCreateTestDoc?: () => void;
  onDeleteDoc: (id: string) => void;
  onRenameDoc: (id: string, newTitle: string) => void;
  onDuplicateDoc: (doc: Document) => void;
}

export const DocumentDrawer: React.FC<DocumentDrawerProps> = ({
  isOpen,
  onClose,
  documents,
  activeDocId,
  onSelectDoc,
  onCreateNewDoc,
  onCreateTestDoc,
  onDeleteDoc,
  onRenameDoc,
  onDuplicateDoc,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  if (!isOpen) return null;

  const filteredDocs = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.plainText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startRename = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(doc.id);
    setEditingTitle(doc.title);
  };

  const saveRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameDoc(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md h-full bg-white/30 dark:bg-slate-900/60 backdrop-blur-2xl border-l border-white/30 p-6 flex flex-col text-slate-900 dark:text-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center border border-sky-300/40">
                <FileText className="w-5 h-5 text-sky-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Mis Documentos</h2>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {documents.length} documento(s) guardados
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

          {/* Search Header */}
          <div className="py-4 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 dark:text-slate-300" />
              <input
                type="text"
                placeholder="Buscar por título o contenido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/30 dark:bg-slate-800/40 border border-white/40 text-slate-900 dark:text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-12 text-slate-700 dark:text-slate-300 space-y-2">
                <FileText className="w-10 h-10 mx-auto opacity-50" />
                <p className="text-sm font-medium">No se encontraron documentos.</p>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isActive = doc.id === activeDocId;
                const formattedDate = new Date(doc.updatedAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <motion.div
                    key={doc.id}
                    onClick={() => {
                      onSelectDoc(doc.id);
                      onClose();
                    }}
                    whileHover={{ scale: 1.01 }}
                    className={`
                      p-4 rounded-2xl border transition-all cursor-pointer relative group
                      ${
                        isActive
                          ? 'bg-white/50 dark:bg-slate-800/80 border-sky-400 shadow-lg'
                          : 'bg-white/20 dark:bg-slate-800/30 border-white/30 hover:bg-white/35 dark:hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {editingId === doc.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveRename(doc.id)}
                              autoFocus
                              className="px-2 py-1 text-xs rounded bg-white text-slate-900 border font-bold w-full"
                            />
                            <button
                              onClick={() => saveRename(doc.id)}
                              className="p-1 bg-emerald-500 text-white rounded cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <h3 className="text-sm font-bold truncate text-slate-900 dark:text-white">
                            {doc.title || 'Sin Título'}
                          </h3>
                        )}

                        <p className="text-xs text-slate-700 dark:text-slate-300 truncate mt-1 font-normal">
                          {doc.plainText || 'Documento vacío'}
                        </p>

                        <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-700 dark:text-slate-300 font-semibold">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formattedDate}
                          </span>
                          <span>•</span>
                          <span>{doc.wordCount} palabras</span>
                        </div>
                      </div>

                      {/* Action Menu Buttons */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startRename(doc, e)}
                          title="Renombrar"
                          className="p-1.5 rounded-lg hover:bg-white/30 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateDoc(doc);
                          }}
                          title="Duplicar"
                          className="p-1.5 rounded-lg hover:bg-white/30 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const dataUrl = await generateDocumentJpg(doc.title || 'documento', doc.content || '', doc.plainText || '');
                            downloadDataURL(`${doc.title || 'documento'}.jpg`, dataUrl);
                          }}
                          title="Descargar JPG"
                          className="p-1.5 rounded-lg hover:bg-white/30 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDoc(doc.id);
                          }}
                          title="Eliminar"
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-600 dark:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Bottom Action: Create New Document & Save Exit */}
          <div className="pt-4 border-t border-white/20 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onCreateNewDoc();
                  onClose();
                }}
                className="flex-1 py-3 px-3 rounded-2xl bg-orange-600/90 hover:bg-orange-500 text-white font-bold text-xs shadow-lg border border-orange-400/50 backdrop-blur-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Nuevo</span>
              </button>

              {onCreateTestDoc && (
                <button
                  onClick={() => {
                    onCreateTestDoc();
                    onClose();
                  }}
                  className="flex-1 py-3 px-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 font-bold text-xs shadow-lg border border-amber-400/40 backdrop-blur-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <TestTube className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Hoja de Prueba</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Guardar y Cerrar Lista</span>
            </button>

            <p className="text-center text-[10px] text-slate-300 font-medium pt-1">
              ✓ Todos los archivos se guardan y sincronizan automáticamente.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
