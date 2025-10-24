import { RedoOutlined } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useUndoRedo } from "../../documents/editor/EditorContext";

const RedoButton = () => {
	const { canRedo, redo } = useUndoRedo();
	return (
		<Tooltip title="Redo">
			<span
				style={{
					display: "flex",
					marginLeft: 0,
				}}
			>
				<IconButton
					disabled={!canRedo}
					onClick={redo}
					style={{ paddingLeft: 14, paddingRight: 14, marginLeft: 0 }}
				>
					<RedoOutlined fontSize="small" />
				</IconButton>
			</span>
		</Tooltip>
	);
};

export default RedoButton;
