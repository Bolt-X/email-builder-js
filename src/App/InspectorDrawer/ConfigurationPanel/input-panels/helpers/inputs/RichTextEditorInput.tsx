import Blockquote from '@tiptap/extension-blockquote';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { ListItem } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Text from '@tiptap/extension-text';
import TextAlign from '@tiptap/extension-text-align';
import { Dropcursor } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import {
  LinkBubbleMenu,
  LinkBubbleMenuHandler,
  MenuButtonBlockquote,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonEditLink,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonSubscript,
  MenuButtonSuperscript,
  MenuButtonUnderline,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  type RichTextEditorRef,
} from 'mui-tiptap';
import { useRef } from 'react';

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
        Text,
        Paragraph,
        Link,
        LinkBubbleMenuHandler,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Superscript,
        Blockquote,
        ListItem,
        Subscript,
        Dropcursor,
        Image,
      ]} // Or any Tiptap extensions you wish!
      content={defaultValue}
      onUpdate={({ editor }) => {
        onChange(editor.getHTML());
      }}
      // Initial content for the editor
      // Optionally include `renderControls` for a menu-bar atop the editor:
      renderControls={() => (
        <MenuControlsContainer>
          <MenuSelectHeading />
          <MenuDivider />
          <MenuButtonBold />
          <MenuButtonItalic />
          <MenuButtonUnderline />
          <MenuButtonBlockquote />
          <MenuButtonEditLink />
          <LinkBubbleMenu />
          <MenuButtonSubscript />
          <MenuButtonSuperscript />
          <MenuButtonOrderedList />
          <MenuButtonBulletedList />
        </MenuControlsContainer>
      )}
    />
  );
};

export default RichTextEditorInput;
