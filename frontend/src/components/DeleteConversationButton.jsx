import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/chat-delete.css';

export default function DeleteConversationButton({ conversation, onDelete }) {
  const dialog = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirmDelete = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await onDelete(conversation);
      dialog.current?.close();
    } catch {
      setError('Unable to delete conversation. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <>
    <button type="button" className="chat-delete-icon" aria-label="Delete conversation"
      title="Delete conversation" onClick={(event) => {
        event.stopPropagation();
        setError('');
        dialog.current.showModal();
      }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
      </svg>
    </button>
    {createPortal(<dialog ref={dialog} className="chat-delete-dialog" aria-label="Delete conversation"
      onClick={(event) => event.stopPropagation()}
      onCancel={(event) => { if (busy) event.preventDefault(); }}>
      <h3>Delete conversation?</h3>
      <p>This deletes this conversation and all its messages for both users.</p>
      {error && <p role="alert" className="chat-delete-error">{error}</p>}
      <div className="chat-delete-actions">
        <button type="button" autoFocus disabled={busy} onClick={() => dialog.current.close()}>Cancel</button>
        <button type="button" className="chat-delete-confirm" disabled={busy} onClick={confirmDelete}>
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </dialog>, document.body)}
  </>;
}
