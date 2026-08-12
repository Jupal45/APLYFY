import React, { useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Palette,
  Highlighter,
  Undo,
  Redo,
  RemoveFormatting,
  Smile,
  Calendar,
  Minus,
} from 'lucide-react';

interface EditorToolbarProps {
  onExecCommand: (command: string, value?: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  highlightColor: string;
  setHighlightColor: (color: string) => void;
  onInsertEmoji: (emoji: string) => void;
  onInsertDateTime: () => void;
}

const FONTS = [
  { name: 'Sans-serif', value: 'sans-serif' },
  { name: 'Serif (Elegante)', value: 'Georgia, serif' },
  { name: 'Monospace (Código)', value: 'Courier New, monospace' },
  { name: 'Playfair Display', value: '"Playfair Display", Georgia, serif' },
  { name: 'Cursive (Manuscrita)', value: '"Dancing Script", cursive' },
  { name: 'Inter', value: 'Inter, system-ui, sans-serif' },
];

const FONT_SIZES = [
  { label: '12 px', value: '12px' },
  { label: '14 px', value: '14px' },
  { label: '16 px', value: '16px' },
  { label: '18 px', value: '18px' },
  { label: '20 px', value: '20px' },
  { label: '24 px', value: '24px' },
  { label: '28 px', value: '28px' },
  { label: '32 px', value: '32px' },
  { label: '36 px', value: '36px' },
  { label: '48 px', value: '48px' },
  { label: '72 px', value: '72px' },
];

const PRESET_COLORS = [
  '#000000', '#0f172a', '#334155', '#dc2626', '#ea580c', '#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777'
];

const PRESET_HIGHLIGHTS = [
  'transparent', '#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#e9d5ff', '#fed7aa'
];

const EMOJIS = ['✨', '📝', '💡', '🌅', '❤️', '⭐', '🌊', '🚀', '📌', '✅', '🔥', '🎉'];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onExecCommand,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  textColor,
  setTextColor,
  highlightColor,
  setHighlightColor,
  onInsertEmoji,
  onInsertDateTime,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeButtons, setActiveButtons] = useState<Record<string, boolean>>({});

  // Sync with document selection active formatting states
  useEffect(() => {
    const syncSelectionFormatting = () => {
      try {
        const isBold = document.queryCommandState('bold');
        const isItalic = document.queryCommandState('italic');
        const isUnderline = document.queryCommandState('underline');
        const isStrike = document.queryCommandState('strikeThrough');
        const isUL = document.queryCommandState('insertUnorderedList');
        const isOL = document.queryCommandState('insertOrderedList');
        const isLeft = document.queryCommandState('justifyLeft');
        const isCenter = document.queryCommandState('justifyCenter');
        const isRight = document.queryCommandState('justifyRight');
        const isFull = document.queryCommandState('justifyFull');

        setActiveButtons((prev) => ({
          ...prev,
          bold: isBold,
          italic: isItalic,
          underline: isUnderline,
          strikeThrough: isStrike,
          insertUnorderedList: isUL,
          insertOrderedList: isOL,
          ...(isLeft ? { justifyLeft: true, justifyCenter: false, justifyRight: false, justifyFull: false } : {}),
          ...(isCenter ? { justifyLeft: false, justifyCenter: true, justifyRight: false, justifyFull: false } : {}),
          ...(isRight ? { justifyLeft: false, justifyCenter: false, justifyRight: true, justifyFull: false } : {}),
          ...(isFull ? { justifyLeft: false, justifyCenter: false, justifyRight: false, justifyFull: true } : {}),
        }));
      } catch {
        // Safe fallback
      }
    };

    document.addEventListener('selectionchange', syncSelectionFormatting);
    return () => {
      document.removeEventListener('selectionchange', syncSelectionFormatting);
    };
  }, []);

  const toggleButton = (key: string, command?: string, value?: string) => {
    setActiveButtons((prev) => {
      const next = { ...prev };

      // Mutual exclusion for alignments
      if (['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].includes(key)) {
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].forEach((k) => {
          if (k !== key) next[k] = false;
        });
      }

      // Mutual exclusion for lists
      if (['insertUnorderedList', 'insertOrderedList'].includes(key)) {
        ['insertUnorderedList', 'insertOrderedList'].forEach((k) => {
          if (k !== key) next[k] = false;
        });
      }

      next[key] = !prev[key];
      return next;
    });

    if (command) {
      onExecCommand(command, value);
    }
  };

  const getBtnClass = (key: string, extra = '') => {
    const isActive = activeButtons[key];
    if (isActive) {
      return `p-2 rounded-xl bg-orange-600 text-white border border-orange-400/90 shadow-[0_0_15px_rgba(249,115,22,0.85)] scale-105 transition-all cursor-pointer ${extra}`;
    }
    return `p-2 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer ${extra}`;
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFontFamily(val);
    onExecCommand('fontName', val);
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFontSize(val);
    onExecCommand('fontSize', val);
  };

  const applyColor = (color: string) => {
    setTextColor(color);
    onExecCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const applyHighlight = (color: string) => {
    setHighlightColor(color);
    onExecCommand('hiliteColor', color);
    setShowHighlightPicker(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-white/20 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/30 border-t-white/60 shadow-xl text-slate-800 dark:text-slate-100 relative z-20">
      {/* Font Family Selector */}
      <div className="flex items-center gap-1 bg-white/40 dark:bg-slate-800/50 rounded-xl px-2 py-1 border border-white/40">
        <select
          value={fontFamily}
          onChange={handleFontChange}
          className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value} className="bg-slate-800 text-white">
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size Selector */}
      <div className="flex items-center gap-1 bg-white/40 dark:bg-slate-800/50 rounded-xl px-2 py-1 border border-white/40">
        <select
          value={fontSize}
          onChange={handleSizeChange}
          className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
        >
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value} className="bg-slate-800 text-white">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-5 w-px bg-white/30 my-auto" />

      {/* Formatting Style Buttons */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleButton('bold', 'bold')}
        title="Negrita (Ctrl+B)"
        className={getBtnClass('bold', 'font-bold')}
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleButton('italic', 'italic')}
        title="Cursiva (Ctrl+I)"
        className={getBtnClass('italic', 'italic')}
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleButton('underline', 'underline')}
        title="Subrayado (Ctrl+U)"
        className={getBtnClass('underline', 'underline')}
      >
        <Underline className="w-4 h-4" />
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleButton('strikeThrough', 'strikeThrough')}
        title="Tachado"
        className={getBtnClass('strikeThrough')}
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-white/30 my-auto" />

      {/* Text Color Picker Button & Popover */}
      <div className="relative">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowHighlightPicker(false);
            setShowEmojiPicker(false);
          }}
          title="Color de Texto"
          className="p-2 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/60 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Palette className="w-4 h-4" />
          <div
            className="w-3.5 h-3.5 rounded-full border border-white shadow-sm shrink-0"
            style={{ backgroundColor: textColor }}
          />
        </button>

        {showColorPicker && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className="absolute top-12 left-0 z-50 p-3 rounded-2xl bg-slate-900/95 text-white backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col gap-2 min-w-[170px]"
          >
            <span className="text-[11px] font-bold text-slate-300 uppercase">Color de Texto</span>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyColor(c)}
                  className="w-6 h-6 rounded-lg border border-white/30 hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input
              type="color"
              value={textColor}
              onChange={(e) => applyColor(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0 mt-1"
            />
          </div>
        )}
      </div>

      {/* Highlight Color Button & Popover */}
      <div className="relative">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowHighlightPicker(!showHighlightPicker);
            setShowColorPicker(false);
            setShowEmojiPicker(false);
          }}
          title="Color de Resaltado / Fondo"
          className="p-2 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/60 transition-all cursor-pointer flex items-center gap-1"
        >
          <Highlighter className="w-4 h-4 text-amber-300" />
        </button>

        {showHighlightPicker && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className="absolute top-12 left-0 z-50 p-3 rounded-2xl bg-slate-900/95 text-white backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col gap-2 min-w-[170px]"
          >
            <span className="text-[11px] font-bold text-slate-300 uppercase">Resaltado / Fondo</span>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_HIGHLIGHTS.map((c) => (
                <button
                  key={c}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyHighlight(c)}
                  className="w-6 h-6 rounded-lg border border-white/30 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center text-[10px]"
                  style={{ backgroundColor: c === 'transparent' ? 'transparent' : c }}
                >
                  {c === 'transparent' && 'Off'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-5 w-px bg-white/30 my-auto" />

      {/* Alignment Buttons */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleButton('justifyLeft', 'justifyLeft')}
        title="Alinear a la izquierda"
        className={getBtnClass('justifyLeft')}
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleButton('justifyCenter', 'justifyCenter')}
        title="Alinear al centro"
        className={getBtnClass('justifyCenter')}
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleButton('justifyRight', 'justifyRight')}
        title="Alinear a la derecha"
        className={getBtnClass('justifyRight')}
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleButton('justifyFull', 'justifyFull')}
        title="Justificar"
        className={getBtnClass('justifyFull')}
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-white/30 my-auto" />

      {/* Lists (Viñetas y Numeración) */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleButton('insertUnorderedList', 'insertUnorderedList')}
        title="Lista con viñetas"
        className={getBtnClass('insertUnorderedList')}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleButton('insertOrderedList', 'insertOrderedList')}
        title="Lista numerada"
        className={getBtnClass('insertOrderedList')}
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-white/30 my-auto" />

      {/* Extra tools: Insert HR, Date/Time, Emoji */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleButton('minus', 'insertHorizontalRule')}
        title="Insertar línea horizontal"
        className={getBtnClass('minus')}
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          onInsertDateTime();
        }}
        title="Insertar fecha y hora actual"
        className="p-2 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
      >
        <Calendar className="w-4 h-4" />
      </button>

      {/* Emoji Picker */}
      <div className="relative">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowColorPicker(false);
            setShowHighlightPicker(false);
          }}
          title="Insertar Emoji"
          className="p-2 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
        >
          <Smile className="w-4 h-4 text-amber-300" />
        </button>

        {showEmojiPicker && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className="absolute top-12 left-0 z-50 p-3 rounded-2xl bg-slate-900/95 text-white backdrop-blur-xl border border-white/20 shadow-2xl min-w-[180px]"
          >
            <span className="text-[11px] font-bold text-slate-300 uppercase block mb-2">Emojis</span>
            <div className="grid grid-cols-4 gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onInsertEmoji(emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-2 rounded-xl hover:bg-white/20 text-lg transition-transform hover:scale-125 cursor-pointer flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-5 w-px bg-white/30 my-auto ml-auto" />

      {/* Undo / Redo / Restoration Button (Restaurar Formato) */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onExecCommand('undo')}
        title="Deshacer (Ctrl+Z)"
        className="p-2 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onExecCommand('redo')}
        title="Rehacer (Ctrl+Y)"
        className="p-2 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
      >
        <Redo className="w-4 h-4" />
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          onExecCommand('removeFormat');
          setActiveButtons({});
        }}
        title="Restaurar formato original"
        className="p-2 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/60 transition-all text-amber-500 hover:text-amber-400 cursor-pointer flex items-center gap-1"
      >
        <RemoveFormatting className="w-4 h-4" />
      </button>
    </div>
  );
};
