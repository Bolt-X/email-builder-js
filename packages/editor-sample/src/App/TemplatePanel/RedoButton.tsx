import { RedoOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useUndoRedo } from '../../documents/editor/EditorContext';

const RedoButton = () => {
  const { canRedo, redo } = useUndoRedo();
  return (
    <Tooltip title="Redo">
      <IconButton disabled={!canRedo} onClick={redo} style={{ paddingLeft: 14, paddingRight: 14, marginLeft: 0 }}>
        <RedoOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default RedoButton;
