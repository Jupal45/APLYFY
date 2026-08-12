import React, { useState, useEffect } from 'react';
import { Background } from './components/Background';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RegisterModal } from './components/RegisterModal';
import { LoginModal } from './components/LoginModal';
import { Lobby } from './components/Lobby';
import { TextEditor } from './components/TextEditor';
import { DocumentDrawer } from './components/DocumentDrawer';
import { QRVaultModal } from './components/QRVaultModal';
import { LogoutModal } from './components/LogoutModal';
import { UserAccount, Document, ActiveScreen } from './types';
import { encodeUserVault, generateQRCodeDataURL } from './utils/qrHelper';
import { createTestDocument } from './utils/testDocument';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('welcome');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDocDrawer, setShowDocDrawer] = useState(false);
  const [showQRVaultModal, setShowQRVaultModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // User & Data State
  const [currentUserAccount, setCurrentUserAccount] = useState<UserAccount | null>(null);
  const [currentQRDataUrl, setCurrentQRDataUrl] = useState<string>('');
  const [activeDocId, setActiveDocId] = useState<string>('');

  // Load account from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aplyfy_user_account');
      if (saved) {
        const parsedAccount: UserAccount = JSON.parse(saved);
        if (parsedAccount && parsedAccount.name) {
          setCurrentUserAccount(parsedAccount);
          setActiveDocId(parsedAccount.documents[0]?.id || '');
          setActiveScreen('lobby');
          encodeUserVault(parsedAccount);
          generateQRCodeDataURL(encodeUserVault(parsedAccount)).then((dataUrl) => {
            setCurrentQRDataUrl(dataUrl);
          }).catch(console.error);
        }
      }
    } catch (err) {
      console.error('Error loading saved account:', err);
    }
  }, []);

  // Update QR Code whenever account state changes in editor
  const refreshAccountAndQR = async (updatedAccount: UserAccount) => {
    setCurrentUserAccount(updatedAccount);
    try {
      localStorage.setItem('aplyfy_user_account', JSON.stringify(updatedAccount));
      const rawVaultString = encodeUserVault(updatedAccount);
      const dataUrl = await generateQRCodeDataURL(rawVaultString);
      setCurrentQRDataUrl(dataUrl);
    } catch (err) {
      console.error("Error refreshing QR Code Data URL:", err);
    }
  };

  // Handle successful registration
  const handleRegisterSuccess = (account: UserAccount, qrDataUrl: string) => {
    setCurrentUserAccount(account);
    setCurrentQRDataUrl(qrDataUrl);
    setActiveDocId(account.documents[0]?.id || '');
    setShowRegisterModal(false);
    setActiveScreen('lobby');
    try {
      localStorage.setItem('aplyfy_user_account', JSON.stringify(account));
    } catch (err) {
      console.error('Error saving account to localStorage:', err);
    }
  };

  // Handle successful login from QR code
  const handleLoginSuccess = (account: UserAccount, qrDataUrl: string) => {
    setCurrentUserAccount(account);
    setCurrentQRDataUrl(qrDataUrl);
    setActiveDocId(account.documents[0]?.id || '');
    setShowLoginModal(false);
    setActiveScreen('lobby');
    try {
      localStorage.setItem('aplyfy_user_account', JSON.stringify(account));
    } catch (err) {
      console.error('Error saving account to localStorage:', err);
    }
  };

  // Select document and open editor
  const handleSelectDoc = (id: string) => {
    setActiveDocId(id);
    setActiveScreen('editor');
  };

  // Handle Document Content Update
  const handleUpdateDocContent = (
    docId: string,
    title: string,
    content: string,
    plainText: string
  ) => {
    if (!currentUserAccount) return;

    const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    const charCount = plainText.length;

    const updatedDocs = currentUserAccount.documents.map((doc) => {
      if (doc.id === docId) {
        return {
          ...doc,
          title,
          content,
          plainText,
          wordCount,
          charCount,
          updatedAt: Date.now(),
        };
      }
      return doc;
    });

    const updatedAccount: UserAccount = {
      ...currentUserAccount,
      updatedAt: Date.now(),
      documents: updatedDocs,
    };

    refreshAccountAndQR(updatedAccount);
  };

  // Create New Document
  const handleCreateNewDoc = () => {
    if (!currentUserAccount) return;

    const newDocId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDoc: Document = {
      id: newDocId,
      title: `Nuevo Documento ${currentUserAccount.documents.length + 1}`,
      content: '',
      plainText: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      fontFamily: 'sans-serif',
      fontSize: '16px',
      wordCount: 0,
      charCount: 0,
    };

    const updatedAccount: UserAccount = {
      ...currentUserAccount,
      updatedAt: Date.now(),
      documents: [newDoc, ...currentUserAccount.documents],
    };

    setActiveDocId(newDocId);
    setActiveScreen('editor');
    refreshAccountAndQR(updatedAccount);
  };

  // Create Default Test Document (Hoja de Prueba de Caracteres, Colores y Fuentes)
  const handleCreateTestDoc = () => {
    if (!currentUserAccount) return;

    const testDoc = createTestDocument();
    const updatedAccount: UserAccount = {
      ...currentUserAccount,
      updatedAt: Date.now(),
      documents: [testDoc, ...currentUserAccount.documents],
    };

    setActiveDocId(testDoc.id);
    setActiveScreen('editor');
    refreshAccountAndQR(updatedAccount);
  };

  // Delete Document
  const handleDeleteDoc = (docId: string) => {
    if (!currentUserAccount) return;

    let updatedDocs = currentUserAccount.documents.filter((d) => d.id !== docId);

    if (updatedDocs.length === 0) {
      const newDocId = `doc_${Date.now()}`;
      const newDoc: Document = {
        id: newDocId,
        title: 'Nuevo Documento',
        content: '',
        plainText: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        fontFamily: 'sans-serif',
        fontSize: '16px',
        wordCount: 0,
        charCount: 0,
      };
      updatedDocs = [newDoc];
    }

    const updatedAccount: UserAccount = {
      ...currentUserAccount,
      updatedAt: Date.now(),
      documents: updatedDocs,
    };

    if (activeDocId === docId || !updatedDocs.find((d) => d.id === activeDocId)) {
      setActiveDocId(updatedDocs[0].id);
    }

    refreshAccountAndQR(updatedAccount);
  };

  // Rename Document
  const handleRenameDoc = (docId: string, newTitle: string) => {
    if (!currentUserAccount) return;

    const updatedDocs = currentUserAccount.documents.map((d) => {
      if (d.id === docId) {
        return { ...d, title: newTitle, updatedAt: Date.now() };
      }
      return d;
    });

    const updatedAccount: UserAccount = {
      ...currentUserAccount,
      updatedAt: Date.now(),
      documents: updatedDocs,
    };

    refreshAccountAndQR(updatedAccount);
  };

  // Duplicate Document
  const handleDuplicateDoc = (doc: Document) => {
    if (!currentUserAccount) return;

    const newDocId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDoc: Document = {
      ...doc,
      id: newDocId,
      title: `${doc.title} (Copia)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedAccount: UserAccount = {
      ...currentUserAccount,
      updatedAt: Date.now(),
      documents: [newDoc, ...currentUserAccount.documents],
    };

    setActiveDocId(newDocId);
    setActiveScreen('editor');
    refreshAccountAndQR(updatedAccount);
  };

  // Confirm Logout and Return to Welcome Screen
  const handleConfirmLogout = () => {
    try {
      localStorage.removeItem('aplyfy_user_account');
    } catch (err) {
      console.error('Error clearing localStorage on logout:', err);
    }
    setShowLogoutModal(false);
    setCurrentUserAccount(null);
    setCurrentQRDataUrl('');
    setActiveDocId('');
    setActiveScreen('welcome');
  };

  // Active document object
  const activeDoc = currentUserAccount?.documents.find((d) => d.id === activeDocId) ||
    currentUserAccount?.documents[0] || {
      id: 'default',
      title: 'Sin Título',
      content: '',
      plainText: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      fontFamily: 'sans-serif',
      fontSize: '16px',
      wordCount: 0,
      charCount: 0,
    };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans selection:bg-amber-300 selection:text-slate-900 overflow-x-hidden">
      {/* Background */}
      <Background />

      {/* Screen Router */}
      {activeScreen === 'welcome' && (
        <WelcomeScreen
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenRegister={() => setShowRegisterModal(true)}
        />
      )}

      {activeScreen === 'lobby' && currentUserAccount && (
        <Lobby
          account={currentUserAccount}
          onSelectDoc={handleSelectDoc}
          onCreateNewDoc={handleCreateNewDoc}
          onCreateTestDoc={handleCreateTestDoc}
          onDeleteDoc={handleDeleteDoc}
          onRenameDoc={handleRenameDoc}
          onDuplicateDoc={handleDuplicateDoc}
          onOpenQRVault={() => setShowQRVaultModal(true)}
          onOpenLogoutModal={() => setShowLogoutModal(true)}
        />
      )}

      {activeScreen === 'editor' && currentUserAccount && (
        <TextEditor
          account={currentUserAccount}
          activeDoc={activeDoc}
          onUpdateDocContent={handleUpdateDocContent}
          onOpenDocDrawer={() => setShowDocDrawer(true)}
          onCreateNewDoc={handleCreateNewDoc}
          onCreateTestDoc={handleCreateTestDoc}
          onOpenQRVault={() => setShowQRVaultModal(true)}
          onOpenLogoutModal={() => setShowLogoutModal(true)}
          onGoToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {/* MODALS */}

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Document Drawer Sidebar */}
      {currentUserAccount && (
        <DocumentDrawer
          isOpen={showDocDrawer}
          onClose={() => setShowDocDrawer(false)}
          documents={currentUserAccount.documents}
          activeDocId={activeDocId}
          onSelectDoc={(id) => setActiveDocId(id)}
          onCreateNewDoc={handleCreateNewDoc}
          onCreateTestDoc={handleCreateTestDoc}
          onDeleteDoc={handleDeleteDoc}
          onRenameDoc={handleRenameDoc}
          onDuplicateDoc={handleDuplicateDoc}
        />
      )}

      {/* Live QR Vault Modal */}
      {currentUserAccount && (
        <QRVaultModal
          isOpen={showQRVaultModal}
          onClose={() => setShowQRVaultModal(false)}
          account={currentUserAccount}
          qrDataUrl={currentQRDataUrl}
        />
      )}

      {/* Final Logout & QR Code Modal */}
      {currentUserAccount && (
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirmLogout={handleConfirmLogout}
          account={currentUserAccount}
          qrDataUrl={currentQRDataUrl}
        />
      )}
    </div>
  );
}
