import { Document } from '../types';

/**
 * Unique Character Set String (no repetitions across latin, numbers, accents & symbols)
 */
export const UNIQUE_CHARACTER_SET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZáéíóúüñÁÉÍÓÚÜÑ0123456789¡!¿?@#$%^&*()_+-=[]{}|;:\'",.<>/~`€¥£©®™°§¶•—–…«»‹›';

/**
 * Generates the pre-filled Default Test Page ("Hoja de Prueba de Funciones, Caracteres, Colores y Fuentes")
 */
export function createTestDocument(idPrefix = 'doc_test'): Document {
  const now = Date.now();
  const id = `${idPrefix}_${now}`;

  const htmlContent = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #000000;">
      <h2 style="font-size: 26px; font-weight: bold; border-bottom: 2px solid #ea580c; padding-bottom: 8px; margin-bottom: 16px; color: #000000;">
        🧪 HOJA DE PRUEBA DE FUNCIONES, COLORES Y FUENTES
      </h2>
      <p style="font-size: 14px; color: #475569; margin-bottom: 20px;">
        Esta es la hoja de prueba predeterminada para verificar todas las capacidades del editor: marca textos, paleta de colores, fuentes, estilos, viñetas y conjunto completo de caracteres sin repetición.
      </p>

      <hr style="margin: 20px 0; border: 0; border-top: 1px solid #cbd5e1;" />

      <!-- 1. Conjunto Único de Caracteres -->
      <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 16px; margin-bottom: 8px;">
        1. Caracteres Posibles Sin Repeticiones (Alfabeto, Acentos, Números y Símbolos)
      </h3>
      <p style="font-size: 15px; font-family: monospace; background-color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; word-break: break-all; color: #0f172a;">
        abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZáéíóúüñÁÉÍÓÚÜÑ0123456789¡!¿?@#$%^&amp;*()_+-=[]{}|;:'",.&lt;&gt;/~&#96;€¥£©®™°§¶•—–…«»‹›
      </p>

      <hr style="margin: 20px 0; border: 0; border-top: 1px solid #cbd5e1;" />

      <!-- 2. Prueba de Marca Textos / Resaltadores -->
      <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 16px; margin-bottom: 8px;">
        2. Prueba de Marca Textos (Colores de Resaltado / Fondo)
      </h3>
      <p style="margin-bottom: 6px;">
        • <span style="background-color: #fef08a; padding: 2px 6px; border-radius: 4px;">Resaltado en Amarillo Suave (#fef08a) - Ideal para ideas clave</span>
      </p>
      <p style="margin-bottom: 6px;">
        • <span style="background-color: #bbf7d0; padding: 2px 6px; border-radius: 4px;">Resaltado en Verde Menta (#bbf7d0) - Para tareas completadas</span>
      </p>
      <p style="margin-bottom: 6px;">
        • <span style="background-color: #bfdbfe; padding: 2px 6px; border-radius: 4px;">Resaltado en Azul Pastel (#bfdbfe) - Recomendado para referencias</span>
      </p>
      <p style="margin-bottom: 6px;">
        • <span style="background-color: #fbcfe8; padding: 2px 6px; border-radius: 4px;">Resaltado en Rosa Chicle (#fbcfe8) - Para aspectos importantes</span>
      </p>
      <p style="margin-bottom: 6px;">
        • <span style="background-color: #e9d5ff; padding: 2px 6px; border-radius: 4px;">Resaltado en Violeta Claro (#e9d5ff) - Para nombres o citas</span>
      </p>
      <p style="margin-bottom: 6px;">
        • <span style="background-color: #fed7aa; padding: 2px 6px; border-radius: 4px;">Resaltado en Naranja Melocotón (#fed7aa) - Para recordatorios</span>
      </p>

      <hr style="margin: 20px 0; border: 0; border-top: 1px solid #cbd5e1;" />

      <!-- 3. Paleta de Colores de Texto -->
      <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 16px; margin-bottom: 8px;">
        3. Paleta de Colores de Texto
      </h3>
      <p style="margin-bottom: 4px; color: #000000;">• Texto en color Negro Azabache (#000000)</p>
      <p style="margin-bottom: 4px; color: #dc2626;">• Texto en color Rojo Carmesí (#dc2626)</p>
      <p style="margin-bottom: 4px; color: #ea580c;">• Texto en color Naranja Vibrante (#ea580c)</p>
      <p style="margin-bottom: 4px; color: #d97706;">• Texto en color Ámbar Dorado (#d97706)</p>
      <p style="margin-bottom: 4px; color: #059669;">• Texto en color Verde Esmeralda (#059669)</p>
      <p style="margin-bottom: 4px; color: #2563eb;">• Texto en color Azul Intenso (#2563eb)</p>
      <p style="margin-bottom: 4px; color: #7c3aed;">• Texto en color Violeta Real (#7c3aed)</p>
      <p style="margin-bottom: 4px; color: #db2777;">• Texto en color Rosa Fucsia (#db2777)</p>

      <hr style="margin: 20px 0; border: 0; border-top: 1px solid #cbd5e1;" />

      <!-- 4. Fuentes Tipográficas -->
      <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 16px; margin-bottom: 8px;">
        4. Fuentes Tipográficas Disponibles
      </h3>
      <p style="font-family: sans-serif; margin-bottom: 6px;">
        • <strong>Sans-serif:</strong> Tipografía moderna, limpia y altamente legible.
      </p>
      <p style="font-family: Georgia, serif; margin-bottom: 6px;">
        • <strong>Serif Elegante (Georgia):</strong> Estilo editorial tradicional y formal.
      </p>
      <p style="font-family: Courier New, monospace; margin-bottom: 6px;">
        • <strong>Monospace (Courier):</strong> Tipografía de código y máquina de escribir.
      </p>
      <p style="font-family: 'Playfair Display', Georgia, serif; margin-bottom: 6px;">
        • <strong>Playfair Display:</strong> Fuente sofisticada para titulares distinguidos.
      </p>
      <p style="font-family: 'Dancing Script', cursive; font-size: 20px; margin-bottom: 6px;">
        • <strong>Cursive Manuscrita:</strong> Tipografía fluida tipo firma personal.
      </p>

      <hr style="margin: 20px 0; border: 0; border-top: 1px solid #cbd5e1;" />

      <!-- 5. Formatos de Texto y Listas -->
      <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 16px; margin-bottom: 8px;">
        5. Formatos, Viñetas y Alineaciones
      </h3>
      <p style="margin-bottom: 8px;">
        Demostración combinada de <strong>Negrita</strong>, <em>Cursiva</em>, <u>Subrayado</u> y <s>Tachado</s> en un mismo párrafo.
      </p>

      <p style="font-weight: bold; margin-top: 12px; margin-bottom: 4px;">Lista con Viñetas (Puntos):</p>
      <ul>
        <li>Primer elemento con viñeta activa</li>
        <li>Segundo elemento con <span style="background-color: #fef08a;">resaltador amarillo</span></li>
        <li>Tercer elemento en <span style="color: #2563eb;">color azul</span></li>
      </ul>

      <p style="font-weight: bold; margin-top: 12px; margin-bottom: 4px;">Lista Numerada:</p>
      <ol>
        <li>Paso uno de la prueba</li>
        <li>Paso dos con <strong>formato en negrita</strong></li>
        <li>Paso tres finalizado</li>
      </ol>

      <div style="text-align: center; margin: 16px 0; padding: 10px; background-color: #f1f5f9; border-radius: 8px;">
        ✨ Texto alineado al centro con emojis: 🚀 📌 ✅ 🔥 🎉 ⭐ 🌊
      </div>

      <div style="text-align: right; margin: 16px 0; font-style: italic; color: #64748b;">
        Texto alineado a la derecha — APLYFY Editor
      </div>
    </div>
  `;

  const plainText =
    'HOJA DE PRUEBA DE FUNCIONES, COLORES Y FUENTES. Caracteres sin repeticiones: ' +
    UNIQUE_CHARACTER_SET +
    ' Probar marca textos, colores de texto, fuentes tipográficas, viñetas y formatos.';

  return {
    id,
    title: 'Hoja de Prueba',
    content: htmlContent,
    plainText,
    createdAt: now,
    updatedAt: now,
    fontFamily: 'sans-serif',
    fontSize: '16px',
    wordCount: 150,
    charCount: plainText.length,
  };
}
