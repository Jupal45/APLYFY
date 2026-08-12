import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  FolderOpen,
  ArrowLeft,
  QrCode,
  LogOut,
  Download,
  Printer,
  Sparkles,
  Maximize2,
  Minimize2,
  Check,
  Share2,
  Lock,
  Eye,
  FileCode,
  Save,
  CheckCircle2,
  TestTube,
} from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { ExportJpgModal } from './ExportJpgModal';
import { Document, UserAccount } from '../types';
import { downloadFile } from '../utils/qrHelper';
import { generateDocumentJpg } from '../utils/exportJpg';

interface TextEditorProps {
  account: UserAccount;
  activeDoc: Document;
  onUpdateDocContent: (docId: string, title: string, content: string, plainText: string) => void;
  onOpenDocDrawer: () => void;
  onCreateNewDoc: () => void;
  onCreateTestDoc?: () => void;
  onOpenQRVault: () => void;
  onOpenLogoutModal: () => void;
  onGoToLobby?: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  account,
  activeDoc,
  onUpdateDocContent,
  onOpenDocDrawer,
  onCreateNewDoc,
  onCreateTestDoc,
  onOpenQRVault,
  onOpenLogoutModal,
  onGoToLobby,
}) => {
  const [docTitle, setDocTitle] = useState(activeDoc.title);
  const [fontFamily, setFontFamily] = useState(activeDoc.fontFamily || 'sans-serif');
  const [fontSize, setFontSize] = useState(activeDoc.fontSize || '16px');
  const [textColor, setTextColor] = useState('#0f172a');
  const [highlightColor, setHighlightColor] = useState('transparent');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Export JPG Modal State
  const [showExportJpgModal, setShowExportJpgModal] = useState(false);
  const [isGeneratingJpg, setIsGeneratingJpg] = useState(false);
  const [jpgDataUrl, setJpgDataUrl] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  // Sync internal title state when active doc changes
  useEffect(() => {
    setDocTitle(activeDoc.title);
    setFontFamily(activeDoc.fontFamily || 'sans-serif');
    setFontSize(activeDoc.fontSize || '16px');
    if (editorRef.current && editorRef.current.innerHTML !== activeDoc.content) {
      editorRef.current.innerHTML = activeDoc.content || '';
    }
  }, [activeDoc.id]);

  // Handle rich text command execution
  const handleExecCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
    }

    try {
      document.execCommand('styleWithCSS', false, 'true');
    } catch {
      // Safe fallback
    }

    if (command === 'fontSize' && value) {
      document.execCommand('fontSize', false, '7');
      const fontElements = editorRef.current?.querySelectorAll('font[size="7"]');
      fontElements?.forEach((el) => {
        el.removeAttribute('size');
        (el as HTMLElement).style.fontSize = value;
      });
    } else if (command === 'fontName' && value) {
      document.execCommand('fontName', false, value);
      const fontElements = editorRef.current?.querySelectorAll('font[face]');
      fontElements?.forEach((el) => {
        const face = el.getAttribute('face');
        el.removeAttribute('face');
        (el as HTMLElement).style.fontFamily = face || value;
      });
    } else if (command === 'foreColor' && value) {
      document.execCommand('foreColor', false, value);
    } else if (command === 'hiliteColor' && value) {
      if (!document.execCommand('hiliteColor', false, value)) {
        document.execCommand('backColor', false, value);
      }
    } else if (command === 'removeFormat') {
      document.execCommand('removeFormat', false, '');
      document.execCommand('unlink', false, '');
      document.execCommand('formatBlock', false, '<p>');
    } else {
      document.execCommand(command, false, value || '');
    }

    saveSelection();
    handleContentChange();
  };

  // Content change handler
  const handleContentChange = () => {
    if (!editorRef.current) return;
    setSaveStatus('saving');

    const htmlContent = editorRef.current.innerHTML;
    const plainText = editorRef.current.innerText || '';

    onUpdateDocContent(activeDoc.id, docTitle, htmlContent, plainText);

    setTimeout(() => {
      setSaveStatus('saved');
    }, 400);
  };

  // Manual explicit save action
  const handleManualSave = () => {
    if (!editorRef.current) return;
    const htmlContent = editorRef.current.innerHTML;
    const plainText = editorRef.current.innerText || '';
    onUpdateDocContent(activeDoc.id, docTitle, htmlContent, plainText);
    setSaveStatus('saved');
    triggerToast('¡Documento guardado correctamente!');
  };

  // Save and Exit action
  const handleSaveAndExit = () => {
    handleManualSave();
    if (onGoToLobby) {
      onGoToLobby();
    } else {
      onOpenDocDrawer();
    }
  };

  // Handle Title Change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setDocTitle(newTitle);
    if (!editorRef.current) return;
    onUpdateDocContent(activeDoc.id, newTitle, editorRef.current.innerHTML, editorRef.current.innerText || '');
  };

  // Insert Emoji
  const handleInsertEmoji = (emoji: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, emoji);
      handleContentChange();
    }
  };

  // Insert Date Time
  const handleInsertDateTime = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      const now = new Date().toLocaleString('es-ES', {
        dateStyle: 'full',
        timeStyle: 'short',
      });
      document.execCommand('insertText', false, ` [${now}] `);
      handleContentChange();
    }
  };

  // Export handler: Always generates a high quality JPG (white background, black text) with preview
  const handlePrepareJpgExport = async () => {
    setShowExportMenu(false);
    setShowExportJpgModal(true);
    setIsGeneratingJpg(true);
    try {
      const html = editorRef.current?.innerHTML || activeDoc.content || '';
      const textContent = editorRef.current?.innerText || activeDoc.plainText || '';
      const dataUrl = await generateDocumentJpg(docTitle, html, textContent);
      setJpgDataUrl(dataUrl);
    } catch (err) {
      console.error('Error al generar la vista previa JPG:', err);
    } finally {
      setIsGeneratingJpg(false);
    }
  };

  // Live stats calculation
  const text = editorRef.current?.innerText || '';
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className={`relative z-10 flex flex-col min-h-screen text-slate-900 dark:text-slate-100 ${isFullScreen ? 'p-0' : 'p-3 sm:p-6'}`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl border border-emerald-400 flex items-center gap-2 backdrop-blur-xl"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formatting Toolbar */}
      <div className="mb-3">
        <EditorToolbar
          onExecCommand={handleExecCommand}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          fontSize={fontSize}
          setFontSize={setFontSize}
          textColor={textColor}
          setTextColor={setTextColor}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
          onInsertEmoji={handleInsertEmoji}
          onInsertDateTime={handleInsertDateTime}
        />
      </div>

      {/* Main Document Paper Canvas Container (Liquid Glass Frame) */}
      <div className="flex-1 flex flex-col items-center justify-start py-2 w-full max-w-7xl mx-auto">
        <motion.div
          layout
          className={`
            w-full min-h-[750px] rounded-3xl p-6 sm:p-12 md:p-16
            bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl
            border border-white/60 dark:border-white/20
            shadow-[0_12px_40px_0_rgba(0,0,0,0.5)]
            flex flex-col relative transition-all duration-300
            ${isFullScreen ? 'fixed inset-2 z-50 max-w-none min-h-0' : ''}
          `}
        >
          {/* Floating Top Right Canvas Actions: Fullscreen toggle */}
          <div className="absolute top-4 right-4 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
              title={isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Editable Document Area */}
          <div
            ref={editorRef}
            contentEditable
            onInput={() => {
              saveSelection();
              handleContentChange();
            }}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onSelect={saveSelection}
            suppressContentEditableWarning
            className="flex-1 outline-none min-h-[650px] leading-relaxed text-slate-900 dark:text-slate-100 font-sans selection:bg-orange-300 dark:selection:bg-orange-700"
            style={{
              fontFamily: fontFamily,
              fontSize: fontSize,
            }}
          />
        </motion.div>
      </div>

      {/* Bottom Header Navigation Bar & Action Bar (Moved from Top to Bottom) */}
      {!isFullScreen && (
        <header className="mt-4 p-3 sm:p-4 rounded-[2rem] bg-slate-900/90 backdrop-blur-3xl border border-white/20 shadow-2xl flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          {/* Left: User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-base border-2 border-orange-400 shadow-md">
              {account.name ? account.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-none">
                  {account.name}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Cuenta Activa
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium">APLYFY</p>
            </div>
          </div>

          {/* Center: Document Title Input */}
          <div className="flex-1 max-w-xs sm:max-w-md mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={docTitle}
                onChange={handleTitleChange}
                placeholder="Título del documento..."
                className="w-full px-4 py-2 rounded-2xl bg-slate-800/80 border border-white/20 font-bold text-sm text-white placeholder-slate-400 text-center focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Right: Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Exit to Lobby Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveAndExit}
              className="p-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs border border-orange-400/50 shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Volver al Lobby"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span>Volver al Lobby</span>
            </motion.button>

            {/* Document Drawer Toggle */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenDocDrawer}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs border border-white/20 flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              title="Ver lista de documentos"
            >
              <FolderOpen className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline">Documentos</span>
            </motion.button>

            {/* Cargar Hoja de Prueba */}
            {onCreateTestDoc && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCreateTestDoc}
                className="p-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-400/40 flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                title="Hoja de Prueba"
              >
                <TestTube className="w-4 h-4 text-amber-400" />
                <span className="hidden xl:inline">Hoja de Prueba</span>
              </motion.button>
            )}

            {/* Export JPG Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrepareJpgExport}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs border border-white/20 flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              title="Exportar documento como imagen JPG"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span className="hidden lg:inline">Exportar (JPG)</span>
            </motion.button>
          </div>
        </header>
      )}

      {/* Bottom Status Bar */}
      <footer className="mt-3 p-3 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/20 flex flex-wrap items-center justify-between text-xs font-semibold text-slate-200 gap-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <span>{wordCount} palabras</span>
          <span>•</span>
          <span>{charCount} caracteres</span>
          <span>•</span>
          <span>~{readingTimeMinutes} min de lectura</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            {saveStatus === 'saving' ? 'Guardando...' : 'Documento Guardado'}
          </span>
        </div>
      </footer>

      {/* Export JPG Modal Preview */}
      <ExportJpgModal
        isOpen={showExportJpgModal}
        onClose={() => setShowExportJpgModal(false)}
        docTitle={docTitle}
        jpgDataUrl={jpgDataUrl}
        isGenerating={isGeneratingJpg}
      />
    </div>
  );
};
