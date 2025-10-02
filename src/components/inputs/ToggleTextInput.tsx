import React, { useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

type Props = {
	value: string | undefined;
	onChange: (val: string) => void;
};

const ToggleTextInput = ({ value, onChange }: Props) => {
	const [isInput, setIsInput] = useState(false);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Placeholder.configure({
				placeholder: "Nhập nội dung...",
			}),
		],
		content: value || "",
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
	});

	// Auto focus vào editor khi chuyển sang input mode
	useEffect(() => {
		if (isInput && editor) {
			setTimeout(() => {
				editor.commands.focus("end"); // focus vào cuối nội dung
			}, 0);
		}
	}, [isInput, editor]);

	if (!editor) return null;

	return !isInput ? (
		<p
			style={{
				width: "100%",
				cursor: "text",
				padding: "9px",
				whiteSpace: "pre-wrap",
				margin: 0,
			}}
			onClick={() => setIsInput(true)}
			dangerouslySetInnerHTML={{ __html: value }}
		/>
	) : (
		<div
			style={{
				width: "100%",
				minHeight: "40px",
				padding: "8px",
				borderRadius: "6px",
				cursor: "text",
				border: "1px solid #ddd", // xám nhạt
				outline: "none",
			}}
			onBlur={() => setIsInput(false)}
		>
			<EditorContent editor={editor} />
		</div>
	);
};

export default ToggleTextInput;
