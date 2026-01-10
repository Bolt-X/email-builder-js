import { TextEditor } from "mui-tiptap-editor";

type Props = {
	defaultValue: string;
	onChange: (v: string) => void;
};

function RichTextEditorInputAlt({ defaultValue, onChange }: Props) {
	return (
		<div>
			<TextEditor
				value={defaultValue}
				onChange={onChange}
				toolbarPosition="top"
				disableTabs={true}
				withBubbleMenu={false}
				toolbar={[
					"heading",
					"bold",
					"italic",
					"strike",
					"link",
					"underline",
					"image",
					"orderedList",
					"bulletList",
					"align",
					"codeBlock",
					"blockquote",
					"table",
					"history",
					"color",
				]}
			/>
		</div>
	);
}

export { RichTextEditorInputAlt };
