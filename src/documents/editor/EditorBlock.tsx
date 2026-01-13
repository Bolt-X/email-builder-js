import React, { createContext, useContext } from "react";

import { EditorBlock as CoreEditorBlock, BLOCK_TYPE_KEYS } from "./core";
import { useDocument } from "./EditorContext";

const EditorBlockContext = createContext<string | null>(null);
export const useCurrentBlockId = () => useContext(EditorBlockContext)!;

type EditorBlockProps = {
	id: string;
};

/**
 *
 * @param id - Block id
 * @returns EditorBlock component that loads data from the EditorDocumentContext
 */
export default function EditorBlock({ id }: EditorBlockProps) {
	const document = useDocument();
	const block = document[id];
	if (!block) {
		console.warn(`Could not find block with id: ${id}`);
		return null;
	}
	if (!BLOCK_TYPE_KEYS.includes(block.type)) {
		console.warn(`Invalid block type: ${block.type} for id: ${id}`);
		return null;
	}
	return (
		<EditorBlockContext.Provider value={id}>
			<CoreEditorBlock {...block} />
		</EditorBlockContext.Provider>
	);
}
