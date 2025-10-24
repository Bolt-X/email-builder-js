import { UndoOutlined } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useUndoRedo } from "../../documents/editor/EditorContext";

const UndoButton = () => {
	const { canUndo, undo } = useUndoRedo();
	return (
		<Tooltip title="Undo">
			<span style={{
        display: "flex"
      }}>
				<IconButton
					disabled={!canUndo}
					onClick={undo}
					style={{ paddingLeft: 14, paddingRight: 14 }}
				>
					<UndoOutlined fontSize="small" />
				</IconButton>
			</span>
		</Tooltip>
	);
};

export default UndoButton;
