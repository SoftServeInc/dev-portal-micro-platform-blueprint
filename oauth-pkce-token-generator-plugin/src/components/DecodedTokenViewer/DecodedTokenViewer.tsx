import React from 'react';
import {
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


interface DecodedTokenViewerProps {
  header: Record<string, any> | null;
  payload: Record<string, any> | null;
  signature: string | null;
}

export const DecodedTokenViewer: React.FC<DecodedTokenViewerProps> = ({header, payload, signature,}) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <Stack direction="column" spacing={2}>
      <Typography variant="h6" gutterBottom>Decoded JWT</Typography>

      {header && (
        <TextField label="Header (JSON)" fullWidth margin="normal" multiline minRows={4}
                   value={JSON.stringify(header, null, 2)}
                   InputProps={{
                     readOnly: true,
                     endAdornment: (
                       <InputAdornment position="end">
                         <IconButton onClick={() => handleCopy(JSON.stringify(header, null, 2))}>
                           <ContentCopyIcon/>
                         </IconButton>
                       </InputAdornment>
                     ),
                   }}
                   sx={{mt: 2, whiteSpace: 'nowrap', overflow: 'visible', textOverflow: 'ellipsis'}}
        />
      )}

      {payload && (
        <TextField label="Payload (JSON)" fullWidth margin="normal" multiline minRows={4}
                   value={JSON.stringify(payload, null, 2)}
                   InputProps={{
                     readOnly: true, endAdornment: (
                       <InputAdornment position="end">
                         <IconButton onClick={() => handleCopy(JSON.stringify(payload, null, 2))}>
                           <ContentCopyIcon/>
                         </IconButton>
                       </InputAdornment>
                     ),
                   }}
                   sx={{mt: 2, whiteSpace: 'nowrap', overflow: 'visible', textOverflow: 'ellipsis',}}
        />
      )}

      {signature && (
        <TextField label="Signature (Raw)" fullWidth margin="normal" value={signature}
                   InputProps={{
                     readOnly: true, endAdornment: (
                       <InputAdornment position="end">
                         <IconButton onClick={() => handleCopy(signature)}><ContentCopyIcon/>
                         </IconButton>
                       </InputAdornment>
                     ),
                   }}
        />)}
    </Stack>
  );
};
