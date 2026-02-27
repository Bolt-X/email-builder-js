import React, { CSSProperties, useState } from "react";

import { Box } from "@mui/material";

import { useCurrentBlockId } from "../../../editor/EditorBlock";
import {
	setSelectedBlockId,
	useDocument,
	useSelectedBlockId,
} from "../../../editor/EditorContext";

import TuneMenu from "./TuneMenu";

type TEditorBlockWrapperProps = {
	children: JSX.Element;
};

export default function EditorBlockWrapper({
	children,
}: TEditorBlockWrapperProps) {
	const selectedBlockId = useSelectedBlockId();
	const [mouseInside, setMouseInside] = useState(false);
	const blockId = useCurrentBlockId();
	const document = useDocument();

	const style = (document[blockId]?.data as any)?.style || {};

	let outline: CSSProperties["outline"];
	if (selectedBlockId === blockId) {
		outline = "2px solid rgba(0,121,204, 1)";
	} else if (mouseInside) {
		outline = "2px solid rgba(0,121,204, 0.3)";
	}

	const renderMenu = () => {
		if (selectedBlockId !== blockId) {
			return null;
		}
		return <TuneMenu blockId={blockId} />;
	};

	const { padding, borderColor, backgroundImage, ...restStyle } = style;
	const cssStyle: CSSProperties = {
		...restStyle,
	};

	if (padding) {
		const { top, bottom, left, right } = padding;
		cssStyle.padding = `${top}px ${right}px ${bottom}px ${left}px`;
	}

	if (borderColor) {
		cssStyle.border = `1px solid ${borderColor}`;
	}

	if (backgroundImage) {
		cssStyle.backgroundImage = `url(${backgroundImage})`;
		cssStyle.backgroundPosition = "center center";
		cssStyle.backgroundSize = "cover";
		cssStyle.backgroundRepeat = "no-repeat";
	}

	return (
		<Box
			sx={{
				position: "relative",
				maxWidth: "100%",
				outlineOffset: "-1px",
				outline,
				...cssStyle,
			}}
			onMouseEnter={(ev) => {
				setMouseInside(true);
				ev.stopPropagation();
			}}
			onMouseLeave={() => {
				setMouseInside(false);
			}}
			onClick={(ev) => {
				setSelectedBlockId(blockId);
				ev.stopPropagation();
				ev.preventDefault();
			}}
		>
			{renderMenu()}
			{children}
		</Box>
	);
}
