import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Copy,
  Edit2,
  Download,
  Calendar,
  LogOut,
  ArrowRight,
  Check,
  AlertTriangle,
  TestTube,
} from 'lucide-react';
import { UserAccount, Document } from '../types';
import { downloadFile } from '../utils/qrHelper';

interface LobbyProps {
  account: UserAccount;
  onSelectDoc: (id: string) => void;
  onCreateNewDoc: () => void;
  onCreateTestDoc: () => void;
  onDeleteDoc: (id: string) => void;
  onRenameDoc: (id: string, newTitle: string) => void;
  onDuplicateDoc: (doc: Document) => void;
  onOpenQRVault: () => void;
  onOpenLogoutModal: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  account,
  onSelectDoc,
  onCreateNewDoc,
  onCreateTestDoc,
  onDeleteDoc,
  onRenameDoc,
  onDuplicateDoc,
  onOpenLogoutModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const filteredDocs = account.documents.filter(
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

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingDocId === id) {
      onDeleteDoc(id);
      setDeletingDocId(null);
    } else {
      setDeletingDocId(id);
      setTimeout(() => {
        setDeletingDocId((prev) => (prev === id ? null : prev));
      }, 4000);
    }
  };

  return (
    <div className="relative z-10 min-h-screen px-4 py-8 sm:px-8 max-w-6xl mx-auto flex flex-col text-white">
      {/* App Main Title at Top */}
      <div className="text-center space-y-2 mb-8 pt-4">
        <h1 className="text-5xl sm:text-7xl font-light tracking-[0.2em] uppercase text-white cursor-default">
          APLYFY
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium cursor-default">
          Tus Documentos ({account.documents.length})
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-md mx-auto w-full mb-8 relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar documentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all hover:border-orange-400/60"
        />
      </div>

      {/* Documents Grid / List */}
      <div className="flex-1 mb-8">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-3 bg-slate-900/50 rounded-3xl border border-white/10 p-8">
            <FileText className="w-12 h-12 mx-auto opacity-40" />
            <p className="text-sm font-medium">No hay documentos encontrados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => {
              const formattedDate = new Date(doc.updatedAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              const isConfirmingDelete = deletingDocId === doc.id;

              return (
                <motion.div
                  key={doc.id}
                  whileHover={{ y: -3 }}
                  className="p-5 rounded-3xl bg-slate-900/80 border border-white/20 hover:border-orange-400/60 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      {editingId === doc.id ? (
                        <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveRename(doc.id)}
                            autoFocus
                            className="px-2 py-1 text-xs rounded bg-slate-800 text-white border border-orange-400 font-bold w-full"
                          />
                          <button
                            onClick={() => saveRename(doc.id)}
                            className="p-1 bg-emerald-600 text-white rounded cursor-pointer shrink-0"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-base font-bold text-white truncate group-hover:text-orange-300 transition-colors">
                          {doc.title || 'Sin Título'}
                        </h3>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed min-h-[3rem]">
                      {doc.plainText || 'Documento vacío...'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-white/10">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                      </span>
                      <span>{doc.wordCount} palabras</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/10 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSelectDoc(doc.id)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-xs border border-orange-400/50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>

                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => startRename(doc, e)}
                        title="Renombrar"
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-slate-200 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateDoc(doc);
                        }}
                        title="Duplicar"
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-slate-200 cursor-pointer transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(`${doc.title || 'documento'}.txt`, doc.plainText);
                        }}
                        title="Descargar TXT"
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-slate-200 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => handleDeleteClick(doc.id, e)}
                        title={isConfirmingDelete ? 'Haz clic para confirmar borrado' : 'Borrar Documento'}
                        className={`p-2 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all border ${
                          isConfirmingDelete
                            ? 'bg-rose-600 text-white border-rose-400 px-2.5'
                            : 'bg-red-950/60 hover:bg-red-800/80 active:bg-red-900 text-red-300 border-red-500/30'
                        }`}
                      >
                        {isConfirmingDelete ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>¿Borrar?</span>
                          </>
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE DOCUMENT BUTTONS */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-8 max-w-xl mx-auto w-full">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          onClick={onCreateNewDoc}
          className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-xs sm:text-sm border border-orange-400/60 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-lg"
        >
          <Plus className="w-5 h-5 shrink-0" />
          <span>Crear Nuevo Documento</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          onClick={onCreateTestDoc}
          className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 active:bg-slate-900 text-amber-300 font-bold text-xs sm:text-sm border border-amber-400/40 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-lg"
        >
          <TestTube className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Hoja de Prueba</span>
        </motion.button>
      </div>

      {/* Bottom Footer Section */}
      <footer className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/90 border border-white/20 backdrop-blur-2xl mt-auto">
        {/* Left: User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-lg border-2 border-orange-400">
            {account.name ? account.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{account.name}</h2>
            <p className="text-[11px] text-orange-300 font-medium">Cuenta Activa</p>
          </div>
        </div>

        {/* Right Actions: Logout */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenLogoutModal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-rose-400 font-semibold text-xs border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </motion.button>
        </div>
      </footer>
    </div>
  );
};
