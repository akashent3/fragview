'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Youtube from '@tiptap/extension-youtube';
import FontFamily from '@tiptap/extension-font-family';
import { Node, Extension, mergeAttributes } from '@tiptap/core';
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote,
  Undo, Redo, Link as LinkIcon, Image as ImageIcon, AlignLeft,
  AlignCenter, AlignRight, Heading1, Heading2, Minus, Type, Video,
  Table as TableIcon,
} from 'lucide-react';

// ── Custom FontSize extension ─────────────────────────────────────────────────
// Adds a `fontSize` attribute to the existing TextStyle mark via global attributes.
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize || null,
            renderHTML: (attributes: Record<string, unknown>) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

// ── Custom Callout / Pull Quote block node ────────────────────────────────────
const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'callout', class: 'callout-block' }),
      0,
    ];
  },
});

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-4' } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-green-600 underline hover:text-green-700' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing your article...' }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      FontSize,
      FontFamily,
      Subscript,
      Superscript,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
      Callout,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-green max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  if (!editor) return null;

  // ── Action helpers ────────────────────────────────────────────────────────
  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addVideo = () => {
    const url = prompt('Enter YouTube or Vimeo URL:');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (url) (editor.chain().focus() as any).setYoutubeVideo({ src: url }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const toggleCallout = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain = editor.chain().focus() as any;
    if (editor.isActive('callout')) {
      chain.lift('callout').run();
    } else {
      chain.wrapIn('callout').run();
    }
  };

  const setFontSize = (size: string) => {
    editor.chain().focus().setMark('textStyle', { fontSize: size || null }).run();
  };

  const setFontFamily = (family: string) => {
    if (family) {
      editor.chain().focus().setFontFamily(family).run();
    } else {
      editor.chain().focus().unsetFontFamily().run();
    }
  };

  // Toolbar button class helper
  const btn = (active = false) =>
    `p-2 rounded hover:bg-gray-200 transition-colors${active ? ' bg-gray-300' : ''}`;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1 items-center">

        {/* Group 1 — Text Formatting */}
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive('strike'))} title="Strikethrough">
          <Strikethrough className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().toggleCode().run()} className={btn(editor.isActive('code'))} title="Inline Code / Fragrance Note Tag">
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Group 2 — Headings */}
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title="Heading 2">
          <Heading1 className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))} title="Heading 3">
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Group 3 — Blocks */}
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="Bullet List">
          <List className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Numbered List">
          <ListOrdered className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))} title="Blockquote">
          <Quote className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn()} title="Horizontal Divider">
          <Minus className="w-4 h-4" />
        </button>
        <button onClick={toggleCallout} className={btn(editor.isActive('callout'))} title="Pull Quote / Callout Block">
          <span
            className="text-[11px] font-bold leading-none"
            style={{ background: '#FBC061', borderRadius: '2px', padding: '2px 4px', color: '#211F1C' }}
          >
            PQ
          </span>
        </button>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Group 4 — Alignment */}
        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btn(editor.isActive({ textAlign: 'left' }))} title="Align Left">
          <AlignLeft className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btn(editor.isActive({ textAlign: 'center' }))} title="Align Center">
          <AlignCenter className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btn(editor.isActive({ textAlign: 'right' }))} title="Align Right">
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Group 5 — Typography: Font Size, Font Family, Color, Highlight */}
        <select
          onChange={(e) => setFontSize(e.target.value)}
          defaultValue=""
          className="h-8 text-xs border border-gray-300 rounded px-1 bg-white text-gray-700 cursor-pointer"
          title="Font Size"
        >
          <option value="">Size</option>
          <option value="0.875rem">Small</option>
          <option value="1rem">Normal</option>
          <option value="1.25rem">Large</option>
          <option value="1.5rem">X-Large</option>
        </select>

        <select
          onChange={(e) => setFontFamily(e.target.value)}
          defaultValue=""
          className="h-8 text-xs border border-gray-300 rounded px-1 bg-white text-gray-700 cursor-pointer"
          title="Font Family"
        >
          <option value="">Font</option>
          <option value="Inter, sans-serif">Sans-serif</option>
          <option value="'Hedvig Letters Serif', Georgia, serif">Serif</option>
          <option value="Georgia, serif">Georgia</option>
        </select>

        {/* Text Color — native picker overlaid on the Type icon */}
        <label className={`${btn()} relative cursor-pointer`} title="Text Color">
          <Type className="w-4 h-4" />
          <input
            type="color"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </label>

        {/* Highlight */}
        <button
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#FBC061' }).run()}
          className={btn(editor.isActive('highlight'))}
          title="Highlight (gold)"
        >
          <span
            className="text-[10px] font-bold leading-none"
            style={{ background: '#FBC061', borderRadius: '2px', padding: '2px 4px', color: '#211F1C' }}
          >
            HL
          </span>
        </button>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Group 6 — Subscript / Superscript */}
        <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={btn(editor.isActive('subscript'))} title="Subscript">
          <span className="text-xs font-medium leading-none select-none">x<sub>2</sub></span>
        </button>
        <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={btn(editor.isActive('superscript'))} title="Superscript">
          <span className="text-xs font-medium leading-none select-none">x<sup>2</sup></span>
        </button>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Group 7 — Table */}
        <button onClick={insertTable} className={btn(editor.isActive('table'))} title="Insert Table (3×3 with header row)">
          <TableIcon className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Group 8 — Media */}
        <button onClick={addLink} className={btn(editor.isActive('link'))} title="Add Link">
          <LinkIcon className="w-4 h-4" />
        </button>
        <button onClick={addImage} className={btn()} title="Add Image">
          <ImageIcon className="w-4 h-4" />
        </button>
        <button onClick={addVideo} className={btn()} title="Embed YouTube / Vimeo Video">
          <Video className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1 self-stretch" />

        {/* Group 9 — History */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>

      </div>

      {/* ── Editor Content ───────────────────────────────────────────────────── */}
      <div className="bg-white min-h-[400px]">
        <EditorContent editor={editor} />
      </div>

    </div>
  );
}
