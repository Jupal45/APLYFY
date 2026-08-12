import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { UserAccount, QRVaultPayload, Document } from '../types';

/**
 * Encodes UserAccount data into a compact QR JSON string optimized for QR code storage limit.
 */
export function encodeUserVault(account: UserAccount): string {
  // Truncate document contents if necessary for QR payload fit
  const safeDocs = account.documents.slice(0, 5).map((doc) => ({
    id: doc.id,
    t: doc.title,
    c: doc.content.length > 300 ? doc.content.substring(0, 300) : doc.content,
    f: doc.fontFamily,
    s: doc.fontSize,
    ca: doc.createdAt,
    ua: doc.updatedAt,
  }));

  // Do not include large data:image base64 strings in the QR code itself to keep payload < 1.5KB
  const safePic = account.profilePicUrl && account.profilePicUrl.startsWith('data:')
    ? "" // Omit large base64 from QR code (retained in account state & .json download)
    : account.profilePicUrl || "";

  const payload: QRVaultPayload = {
    version: "1.0",
    v: "APLYFY",
    u: {
      id: account.id,
      n: account.name,
      p: account.passwordHash,
      pic: safePic,
      d: safeDocs,
    },
  };

  return JSON.stringify(payload);
}

/**
 * Decodes QR code string or JSON payload back into a UserAccount structure.
 */
export function decodeUserVault(rawText: string): { success: boolean; account?: UserAccount; error?: string } {
  try {
    const data = JSON.parse(rawText.trim());
    
    // Validate if it's a valid payload (support APLYFY and legacy tags)
    if ((data.v !== "APLYFY" && data.v !== "AuraTextVault") || !data.u) {
      // Try fallback checking if user passed raw account json
      if (data.id && data.name && data.documents) {
        return {
          success: true,
          account: data as UserAccount,
        };
      }
      return { success: false, error: "El código QR o archivo no pertenece a APLYFY." };
    }

    const u = data.u;
    const documents: Document[] = (u.d || []).map((d: any) => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = d.c || "";
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
      
      return {
        id: d.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: d.t || "Sin Título",
        content: d.c || "",
        plainText: plainText,
        createdAt: d.ca || Date.now(),
        updatedAt: d.ua || Date.now(),
        fontFamily: d.f || "sans-serif",
        fontSize: d.s || "16px",
        wordCount,
        charCount: plainText.length,
      };
    });

    const account: UserAccount = {
      id: u.id || `usr_${Date.now()}`,
      name: u.n || "Usuario",
      passwordHash: u.p || "",
      profilePicUrl: u.pic || "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      documents: documents.length > 0 ? documents : [
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
        }
      ],
    };

    return { success: true, account };
  } catch (err: any) {
    return { success: false, error: "No se pudo leer la información del código QR. Formato no válido." };
  }
}

/**
 * Generates QR Code Data URL image string from raw data string.
 * Guaranteed to never crash even if data is large.
 */
export async function generateQRCodeDataURL(dataString: string): Promise<string> {
  const options: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: 'L',
    margin: 2,
    scale: 8,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  };

  try {
    return await QRCode.toDataURL(dataString, options);
  } catch (err) {
    console.warn("Primary QR generation failed, attempting minimal payload fallback:", err);
    try {
      // Parse payload and compress aggressively
      const parsed = JSON.parse(dataString);
      if (parsed.u) {
        parsed.u.d = (parsed.u.d || []).slice(0, 1).map((d: any) => ({ id: d.id, t: d.t, c: "" }));
        parsed.u.pic = "";
      }
      return await QRCode.toDataURL(JSON.stringify(parsed), options);
    } catch (e2) {
      // Absolute fallback string to guarantee account creation never fails
      return await QRCode.toDataURL(dataString.substring(0, 500), options);
    }
  }
}


/**
 * Reads QR code from an HTMLImageElement or File using HTML5 Canvas & jsQR.
 */
export function scanQRCodeFromImage(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("No se pudo instanciar el contexto de dibujo canvas."));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          resolve(code.data);
        } else {
          // Try inverting image if standard read failed
          const codeInverted = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "onlyInvert",
          });
          if (codeInverted && codeInverted.data) {
            resolve(codeInverted.data);
          } else {
            reject(new Error("No se detectó un código QR válido en la imagen seleccionada. Prueba subiendo el archivo .json de respaldo si la imagen es difusa."));
          }
        }
      };
      img.onerror = () => reject(new Error("Error al cargar el archivo de imagen."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Triggers browser download for files
 */
export function downloadFile(filename: string, content: string, mimeType: string = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a data URL (like PNG base64) as a file
 */
export function downloadDataURL(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
