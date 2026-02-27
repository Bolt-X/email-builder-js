import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link"; // Thêm này nếu chưa có
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline"; // ← THÊM DÒNG NÀY
import StarterKit from "@tiptap/starter-kit";
import {
	LinkBubbleMenu,
	LinkBubbleMenuHandler,
	MenuButtonBlockquote,
	MenuButtonBold,
	MenuButtonBulletedList,
	MenuButtonEditLink,
	MenuButtonHighlightColor,
	MenuButtonItalic,
	MenuButtonOrderedList,
	MenuButtonSubscript,
	MenuButtonSuperscript,
	MenuButtonTextColor,
	MenuButtonUnderline,
	MenuControlsContainer,
	MenuDivider,
	MenuSelectHeading,
	RichTextEditor,
	MenuButtonUndo,
	MenuButtonRedo,
	type RichTextEditorRef,
	MenuButtonStrikethrough,
	MenuButtonAlignLeft,
	MenuButtonAlignCenter,
	MenuButtonAlignRight,
	MenuButtonAlignJustify,
	MenuButtonCodeBlock,
} from "mui-tiptap";
import { useRef } from "react";

type Props = {
	defaultValue: string;
	onChange: (v: string) => void;
};

const RichTextEditorInput = ({ defaultValue, onChange }: Props) => {
	const rteRef = useRef<RichTextEditorRef>(null);

	return (
		<RichTextEditor
			ref={rteRef}
			extensions={[
				StarterKit,
				TextStyle, // Phải có trước Color và Highlight
				Color,
				Highlight.configure({
					multicolor: true,
				}),
				Underline, // ← THÊM VÀO ĐÂY
				Link.configure({
					// Nếu bạn dùng LinkBubbleMenu
					openOnClick: false,
				}),
				LinkBubbleMenuHandler,
				TextAlign.configure({
					types: ["heading", "paragraph"],
				}),
				Superscript,
				Subscript,
				Image,
			]}
			content={defaultValue}
			onUpdate={({ editor }) => {
				onChange(editor.getHTML());
			}}
			renderControls={() => (
				<MenuControlsContainer>
					<MenuSelectHeading />
					<MenuDivider />
					<MenuButtonBold />
					<MenuButtonItalic />
					<MenuButtonUnderline />
					<MenuButtonStrikethrough />
					<MenuDivider />

					<MenuButtonTextColor
						swatchColors={[
							{ value: "#000000", label: "Đen" },
							{ value: "#f44336", label: "Đỏ" },
							{ value: "#2196f3", label: "Xanh dương" },
							{ value: "#4caf50", label: "Xanh lá" },
							{ value: "#ff9800", label: "Cam" },
						]}
					/>

					<MenuButtonHighlightColor
						swatchColors={[
							{ value: "#ffff00", label: "Vàng" },
							{ value: "#00ffff", label: "Xanh lơ" },
							{ value: "#ff00ff", label: "Hồng" },
							{ value: "#00ff00", label: "Xanh lá sáng" },
						]}
					/>

					<MenuDivider />
					<MenuButtonAlignLeft />
					<MenuButtonAlignCenter />
					<MenuButtonAlignRight />
					<MenuButtonAlignJustify />
					<MenuDivider />
					<MenuButtonBlockquote />
					<MenuButtonCodeBlock />
					<MenuDivider />
					<MenuButtonEditLink />
					<LinkBubbleMenu />
					<MenuDivider />
					<MenuButtonOrderedList />
					<MenuButtonBulletedList />
					<MenuButtonUndo />
					<MenuButtonRedo />
				</MenuControlsContainer>
			)}
		/>
	);
};

export default RichTextEditorInput;
