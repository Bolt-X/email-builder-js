import { useState } from 'react';

import { Button, IconButton, Snackbar } from '@mui/material';

import { useDocument } from '../../documents/editor/EditorContext';

export default function ShareButton() {
  const document = useDocument();
  const [message, setMessage] = useState<string | null>(null);

  const onClick = async () => {
    const c = encodeURIComponent(JSON.stringify(document));
    location.hash = `#code/${btoa(c)}`;
    setMessage('The URL was updated. Copy it to share your current template.');
  };

  const onClose = () => {
    setMessage(null);
  };

  return (
    <>
      <Button onClick={onClick} variant="contained" color="primary" sx={{ justifyContent: 'center' }}>
        Save
      </Button>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={message !== null}
        onClose={onClose}
        message={message}
      />
    </>
  );
}
