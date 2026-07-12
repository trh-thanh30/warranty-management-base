"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Extension,
  Node,
  mergeAttributes,
  type JSONContent,
} from "@tiptap/core";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { NodeSelection } from "prosemirror-state";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading2,
  Highlighter,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Palette,
  Quote,
  Redo2,
  Strikethrough,
  UnderlineIcon,
  Undo2,
  UploadCloud,
  VideoIcon,
} from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
import { assetsService } from "@/src/services/assets.service";

const DEFAULT_TEXT_COLOR = "#0f172a";
const AUTOMATIC_TEXT_COLOR = "#000000";
const DEFAULT_HIGHLIGHT_COLOR = "#fef08a";
const DEFAULT_FONT_SIZE = 14;

const THEME_COLOR_COLUMNS = [
  {
    base: "#ffffff",
    shades: ["#f2f2f2", "#d9d9d9", "#bfbfbf", "#a6a6a6", "#808080"],
  },
  {
    base: "#000000",
    shades: ["#7f7f7f", "#595959", "#3f3f3f", "#262626", "#0d0d0d"],
  },
  {
    base: "#e7e6e6",
    shades: ["#d9d9d9", "#bfbfbf", "#a6a6a6", "#808080", "#595959"],
  },
  {
    base: "#1f4e79",
    shades: ["#d9eaf7", "#9cc3e6", "#5b9bd5", "#2e75b6", "#1f4e79"],
  },
  {
    base: "#0f6b83",
    shades: ["#d8f0f6", "#9bd8e8", "#45b8d8", "#0f6b83", "#0b3f4d"],
  },
  {
    base: "#ed7d31",
    shades: ["#fce4d6", "#f8cbad", "#f4b183", "#c55a11", "#833c0c"],
  },
  {
    base: "#16823a",
    shades: ["#e2f0d9", "#a9d18e", "#70ad47", "#16823a", "#0f4c25"],
  },
  {
    base: "#0070c0",
    shades: ["#ddebf7", "#9dc3e6", "#5b9bd5", "#0070c0", "#1f4e79"],
  },
  {
    base: "#c0007a",
    shades: ["#f4d4ea", "#e49edd", "#d86ecc", "#8f126f", "#5f0b4a"],
  },
  {
    base: "#4ea72e",
    shades: ["#e2f0d9", "#c5e0b4", "#92d050", "#548235", "#375623"],
  },
] as const;

const STANDARD_COLOR_OPTIONS = [
  "#c00000",
  "#ff0000",
  "#ffc000",
  "#ffff00",
  "#92d050",
  "#00b050",
  "#00b0f0",
  "#0070c0",
  "#002060",
  "#7030a0",
] as const;

type ColorSelectOptions = {
  close?: boolean;
};

type RichTextEditorProps = {
  disabled?: boolean;
  onChange: (html: string) => void;
  value: string;
};

type RichTextUrlDialogMode = "image" | "video";

type EditorSelectionRange = {
  from: number;
  to: number;
};

const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [{ tag: "video[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(
        {
          class: "my-4 aspect-video w-full rounded-md bg-black",
          controls: true,
        },
        HTMLAttributes,
      ),
    ];
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
        types: ["textStyle"],
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

export function RichTextEditor({
  disabled = false,
  onChange,
  value,
}: RichTextEditorProps) {
  const colorPickerRef = useRef<HTMLDivElement | null>(null);
  const highlightPickerRef = useRef<HTMLDivElement | null>(null);
  const mediaSelectionRef = useRef<EditorSelectionRange | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [fontSizeInputFocused, setFontSizeInputFocused] = useState(false);
  const [fontSizeInput, setFontSizeInput] = useState("");
  const [highlightPickerOpen, setHighlightPickerOpen] = useState(false);
  const [urlDialogMode, setUrlDialogMode] =
    useState<RichTextUrlDialogMode | null>(null);
  const editor = useEditor({
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "min-h-64 px-4 py-3 text-sm leading-7 outline-none prose-headings:font-semibold",
      },
      handleClickOn(view, pos, node, _nodePos, event) {
        if (node.type.name !== "image" && node.type.name !== "video") {
          return false;
        }

        event.preventDefault();
        view.dispatch(
          view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)),
        );
        return true;
      },
      handleDOMEvents: {
        mousedown(view, event) {
          const target = event.target;
          if (
            !(target instanceof HTMLElement) ||
            (target.tagName !== "IMG" && target.tagName !== "VIDEO")
          ) {
            return false;
          }

          const pos = view.posAtDOM(target, 0);
          const node = view.state.doc.nodeAt(pos);
          if (node?.type.name !== "image" && node?.type.name !== "video") {
            return false;
          }

          event.preventDefault();
          view.focus();
          view.dispatch(
            view.state.tr.setSelection(
              NodeSelection.create(view.state.doc, pos),
            ),
          );
          return true;
        },
      },
    },
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class:
            "my-4 block h-auto max-w-full rounded-md border border-slate-200",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Video,
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;

    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!colorPickerOpen) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as globalThis.Node)
      ) {
        setColorPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [colorPickerOpen]);

  useEffect(() => {
    if (!highlightPickerOpen) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (
        highlightPickerRef.current &&
        !highlightPickerRef.current.contains(event.target as globalThis.Node)
      ) {
        setHighlightPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [highlightPickerOpen]);

  const openUrlDialog = useCallback(
    (mode: RichTextUrlDialogMode) => {
      if (editor) {
        const { from, to } = editor.state.selection;
        mediaSelectionRef.current = { from, to };
      }

      setColorPickerOpen(false);
      setHighlightPickerOpen(false);
      setUrlDialogMode(mode);
    },
    [editor],
  );

  const insertMediaUrls = useCallback(
    (urls: string[]) => {
      if (!editor || !urlDialogMode) return;

      const selection = mediaSelectionRef.current;
      const chain = editor.chain().focus();
      if (selection) {
        const docSize = editor.state.doc.content.size;
        chain.setTextSelection({
          from: Math.min(selection.from, docSize),
          to: Math.min(selection.to, docSize),
        });
      }

      if (urlDialogMode === "image") {
        const content = urls
          .map((url) => url.trim())
          .filter(Boolean)
          .flatMap<JSONContent>((src) => [
            {
              attrs: { src },
              type: "image",
            },
            {
              type: "paragraph",
            },
          ]);

        if (content.length) {
          chain.insertContent(content).run();
        }
      }

      if (urlDialogMode === "video") {
        const src = urls[0]?.trim();
        if (!src) return;

        chain
          .insertContent([
            {
              attrs: {
                src,
              },
              type: "video",
            },
            {
              type: "paragraph",
            },
          ])
          .run();
      }

      mediaSelectionRef.current = null;
      setUrlDialogMode(null);
    },
    [editor, urlDialogMode],
  );

  const setTextColor = useCallback(
    (color: string) => {
      if (!editor) return;

      if (!color.trim()) {
        editor.chain().focus().unsetColor().run();
        return;
      }

      const currentColor = editor.getAttributes("textStyle").color as
        | string
        | undefined;
      if (currentColor?.toLowerCase() === color.trim().toLowerCase()) {
        editor.chain().focus().unsetColor().run();
        return;
      }

      editor.chain().focus().setColor(color.trim()).run();
    },
    [editor],
  );

  const setHighlightColor = useCallback(
    (color: string) => {
      if (!editor) return;

      if (!color.trim()) {
        editor.chain().focus().unsetHighlight().run();
        return;
      }

      const currentColor = editor.getAttributes("highlight").color as
        | string
        | undefined;
      if (currentColor?.toLowerCase() === color.trim().toLowerCase()) {
        editor.chain().focus().unsetHighlight().run();
        return;
      }

      editor.chain().focus().setHighlight({ color: color.trim() }).run();
    },
    [editor],
  );

  const setFontSize = useCallback(
    (value: string) => {
      if (!editor) return;

      const normalizedValue = value.trim();
      if (!normalizedValue) {
        editor.chain().focus().unsetFontSize().run();
        return;
      }

      const numericValue = Number(normalizedValue);
      if (!Number.isFinite(numericValue) || numericValue <= 0) return;

      editor.chain().focus().setFontSize(`${numericValue}px`).run();
    },
    [editor],
  );

  const stepFontSize = useCallback(
    (delta: number) => {
      const currentValue = Number(fontSizeInput || DEFAULT_FONT_SIZE);
      const nextValue = Math.max(1, currentValue + delta);
      const nextFontSize = String(nextValue);

      setFontSizeInput(nextFontSize);
      setFontSize(nextFontSize);
    },
    [fontSizeInput, setFontSize],
  );

  const toggleTextAlign = useCallback(
    (alignment: "left" | "center" | "right") => {
      if (!editor) return;

      if (editor.isActive({ textAlign: alignment })) {
        editor.chain().focus().unsetTextAlign().run();
        return;
      }

      editor.chain().focus().setTextAlign(alignment).run();
    },
    [editor],
  );

  const currentTextColor =
    (editor?.getAttributes("textStyle").color as string | undefined) ??
    DEFAULT_TEXT_COLOR;
  const currentHighlightColor =
    (editor?.getAttributes("highlight").color as string | undefined) ??
    DEFAULT_HIGHLIGHT_COLOR;
  const currentFontSize =
    (editor?.getAttributes("textStyle").fontSize as string | undefined) ?? "";

  useEffect(() => {
    if (fontSizeInputFocused) return;

    setFontSizeInput(parseFontSizeValue(currentFontSize));
  }, [currentFontSize, fontSizeInputFocused]);

  if (!editor) {
    return (
      <div className="min-h-64 rounded-md border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950" />
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <TooltipProvider delayDuration={250}>
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50/80 p-2 dark:border-slate-800 dark:bg-slate-900/40">
          <ToolbarButton
            active={editor.isActive("bold")}
            disabled={disabled}
            label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            disabled={disabled}
            label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("underline")}
            disabled={disabled}
            label="Underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("strike")}
            disabled={disabled}
            label="Strike"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            active={editor.isActive("heading", { level: 2 })}
            disabled={disabled}
            label="Heading"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="size-4" />
          </ToolbarButton>
          <FontSizeInput
            disabled={disabled}
            onBlur={() => {
              setFontSizeInputFocused(false);
              setFontSize(fontSizeInput);
            }}
            onFocus={() => setFontSizeInputFocused(true)}
            onStep={stepFontSize}
            value={fontSizeInput}
            onValueChange={setFontSizeInput}
          />
          <ToolbarButton
            active={editor.isActive("bulletList")}
            disabled={disabled}
            label="Bullet list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("orderedList")}
            disabled={disabled}
            label="Ordered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("blockquote")}
            disabled={disabled}
            label="Quote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("codeBlock")}
            disabled={disabled}
            label="Code block"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code className="size-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            active={editor.isActive({ textAlign: "left" })}
            disabled={disabled}
            label="Align left"
            onClick={() => toggleTextAlign("left")}
          >
            <AlignLeft className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "center" })}
            disabled={disabled}
            label="Align center"
            onClick={() => toggleTextAlign("center")}
          >
            <AlignCenter className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "right" })}
            disabled={disabled}
            label="Align right"
            onClick={() => toggleTextAlign("right")}
          >
            <AlignRight className="size-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <div className="relative" ref={colorPickerRef}>
            <ToolbarButton
              active={colorPickerOpen}
              disabled={disabled}
              label="Text color"
              onClick={() => {
                setColorPickerOpen((open) => !open);
                setHighlightPickerOpen(false);
              }}
            >
              <span className="relative inline-flex size-4 items-center justify-center">
                <Palette className="size-4" />
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 h-0.5 w-4 rounded-full"
                  style={{ backgroundColor: currentTextColor }}
                />
              </span>
            </ToolbarButton>
            {colorPickerOpen ? (
              <ColorPicker
                automaticColor={AUTOMATIC_TEXT_COLOR}
                automaticLabel="Automatic"
                currentColor={currentTextColor}
                disabled={disabled}
                onClear={() => {
                  setTextColor("");
                  setColorPickerOpen(false);
                }}
                onSelect={(color, options) => {
                  setTextColor(color);
                  if (options?.close !== false) {
                    setColorPickerOpen(false);
                  }
                }}
              />
            ) : null}
          </div>
          <div className="relative" ref={highlightPickerRef}>
            <ToolbarButton
              active={highlightPickerOpen || editor.isActive("highlight")}
              disabled={disabled}
              label="Highlight"
              onClick={() => {
                setHighlightPickerOpen((open) => !open);
                setColorPickerOpen(false);
              }}
            >
              <span className="relative inline-flex size-4 items-center justify-center">
                <Highlighter className="size-4" />
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 h-0.5 w-4 rounded-full"
                  style={{
                    backgroundColor: editor.isActive("highlight")
                      ? currentHighlightColor
                      : "transparent",
                  }}
                />
              </span>
            </ToolbarButton>
            {highlightPickerOpen ? (
              <ColorPicker
                automaticColor="transparent"
                automaticLabel="No highlight"
                currentColor={currentHighlightColor}
                disabled={disabled}
                onClear={() => {
                  setHighlightColor("");
                  setHighlightPickerOpen(false);
                }}
                onSelect={(color, options) => {
                  setHighlightColor(color);
                  if (options?.close !== false) {
                    setHighlightPickerOpen(false);
                  }
                }}
              />
            ) : null}
          </div>
          <ToolbarDivider />
          <ToolbarButton
            disabled={disabled}
            label="Image"
            onClick={() => openUrlDialog("image")}
          >
            <ImageIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={disabled}
            label="Video"
            onClick={() => openUrlDialog("video")}
          >
            <VideoIcon className="size-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            disabled={disabled || !editor.can().undo()}
            label="Undo"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={disabled || !editor.can().redo()}
            label="Redo"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="size-4" />
          </ToolbarButton>
        </div>
      </TooltipProvider>
      <EditorContent
        className="prose prose-slate max-h-[28rem] max-w-none overflow-y-auto dark:prose-invert [&_.ProseMirror_a]:cursor-pointer [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-slate-300 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-slate-100 [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-[0.85em] [&_.ProseMirror_h1]:mb-3 [&_.ProseMirror_h1]:mt-4 [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-4 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-3 [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_img.ProseMirror-selectednode]:outline [&_.ProseMirror_img.ProseMirror-selectednode]:outline-2 [&_.ProseMirror_img.ProseMirror-selectednode]:outline-offset-4 [&_.ProseMirror_img.ProseMirror-selectednode]:outline-blue-600 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:cursor-pointer [&_.ProseMirror_ol]:my-3 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_pre]:my-4 [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:rounded-md [&_.ProseMirror_pre]:bg-slate-950 [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:text-sm [&_.ProseMirror_pre]:text-slate-50 [&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0 [&_.ProseMirror_pre_code]:text-inherit [&_.ProseMirror_ul]:my-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_video.ProseMirror-selectednode]:outline [&_.ProseMirror_video.ProseMirror-selectednode]:outline-2 [&_.ProseMirror_video.ProseMirror-selectednode]:outline-offset-4 [&_.ProseMirror_video.ProseMirror-selectednode]:outline-blue-600 [&_.ProseMirror_video]:cursor-pointer dark:[&_.ProseMirror_code]:bg-slate-800"
        editor={editor}
      />
      <RichTextUrlDialog
        mode={urlDialogMode}
        onOpenChange={(open) => {
          if (!open) setUrlDialogMode(null);
        }}
        onSubmit={insertMediaUrls}
        open={Boolean(urlDialogMode)}
      />
    </div>
  );
}

function RichTextUrlDialog({
  mode,
  onOpenChange,
  onSubmit,
  open,
}: {
  mode: RichTextUrlDialogMode | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (urls: string[]) => void;
  open: boolean;
}) {
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setError("");
    setFiles([]);
  }, [open]);

  useEffect(() => {
    if (mode !== "image" || !files.length) {
      setImagePreviews([]);
      return;
    }

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [files, mode]);

  if (!mode) return null;

  async function uploadFile() {
    if (!files.length || !mode) return;

    const invalidFile = files.find((file) =>
      mode === "image"
        ? !file.type.startsWith("image/")
        : !file.type.startsWith("video/"),
    );
    if (invalidFile) {
      setError(
        mode === "image"
          ? "Choose a valid image file."
          : "Choose a valid video file.",
      );
      return;
    }

    try {
      setError("");
      setUploading(true);
      const urls: string[] = [];

      for (const file of files) {
        const asset = await assetsService.uploadAsset(file, {
          accessType: "PUBLIC",
          folder: "rich-text",
          type: mode === "image" ? "IMAGE" : "VIDEO",
        });
        urls.push(asset.url);
      }

      onSubmit(urls);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const title = mode === "image" ? "Insert image" : "Insert video";
  const description =
    mode === "image"
      ? "Upload one or more local images."
      : "Upload a local video.";
  const fileAccept = mode === "image" ? "image/*" : "video/*";
  const selectedFileLabel =
    files.length === 0
      ? mode === "image"
        ? "Choose images"
        : "Choose a file"
      : files.length === 1
        ? files[0]?.name
        : `${files.length} images selected`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-5 sm:max-w-lg">
        <div className="space-y-1">
          <DialogTitle className="text-base font-semibold text-slate-950 dark:text-slate-50">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </DialogDescription>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="rich-text-file">
              Upload {mode === "image" ? "image" : "video"}
            </Label>
            <label
              className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900"
              htmlFor="rich-text-file"
            >
              <UploadCloud className="size-5" aria-hidden="true" />
              <span className="font-medium">{selectedFileLabel}</span>
              {mode === "image" && imagePreviews.length ? (
                <div className="mt-3 grid max-h-72 w-full grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
                  {imagePreviews.map((preview, index) => (
                    <div
                      className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
                      key={preview}
                    >
                      <div className="flex h-36 items-center justify-center bg-slate-100 p-2 dark:bg-slate-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={files[index]?.name ?? `Preview ${index + 1}`}
                          className="max-h-full max-w-full rounded object-contain"
                          src={preview}
                        />
                      </div>
                      <div className="border-t border-slate-200 px-2 py-1.5 text-left text-[11px] text-slate-600 dark:border-slate-800 dark:text-slate-300">
                        <span
                          className="block truncate"
                          title={files[index]?.name}
                        >
                          {files[index]?.name ?? `Image ${index + 1}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {mode === "image" ? "Image files" : "Video files"} are uploaded
                as public assets.
              </span>
            </label>
            <input
              accept={fileAccept}
              className="sr-only"
              id="rich-text-file"
              multiple={mode === "image"}
              onChange={(event) =>
                setFiles(Array.from(event.target.files ?? []))
              }
              type="file"
            />
          </div>
          <div className="flex justify-end">
            <Button
              disabled={!files.length || uploading}
              onClick={uploadFile}
              type="button"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {mode === "image" && files.length > 1
                ? "Upload and insert images"
                : "Upload and insert"}
            </Button>
          </div>
        </div>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ToolbarButton({
  active = false,
  children,
  disabled,
  label,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label={label}
          aria-pressed={active}
          className={
            active
              ? "inline-flex size-8 items-center justify-center rounded-md bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-50 dark:ring-slate-700"
              : "inline-flex size-8 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-white hover:text-slate-950 hover:shadow-sm hover:ring-1 hover:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:hover:ring-slate-700"
          }
          disabled={disabled}
          onClick={onClick}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function FontSizeInput({
  disabled,
  onBlur,
  onFocus,
  onStep,
  onValueChange,
  value,
}: {
  disabled?: boolean;
  onBlur: () => void;
  onFocus: () => void;
  onStep: (delta: number) => void;
  onValueChange: (value: string) => void;
  value: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          <span className="font-medium">Size</span>
          <button
            aria-label="Decrease text size"
            className="grid size-5 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            disabled={disabled}
            onClick={() => onStep(-1)}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            -
          </button>
          <input
            aria-label="Text size"
            className="h-6 w-8 bg-transparent text-center font-mono text-xs text-slate-950 outline-none disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-50"
            disabled={disabled}
            inputMode="numeric"
            onBlur={onBlur}
            onChange={(event) => onValueChange(event.target.value)}
            onFocus={onFocus}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
            placeholder="14"
            type="text"
            value={value}
          />
          <button
            aria-label="Increase text size"
            className="grid size-5 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            disabled={disabled}
            onClick={() => onStep(1)}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            +
          </button>
        </div>
      </TooltipTrigger>
      <TooltipContent>Text size</TooltipContent>
    </Tooltip>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-800" />;
}

function ColorPicker({
  automaticColor,
  automaticLabel,
  currentColor,
  disabled,
  onClear,
  onSelect,
}: {
  automaticColor: string;
  automaticLabel: string;
  currentColor: string;
  disabled?: boolean;
  onClear: () => void;
  onSelect: (color: string, options?: ColorSelectOptions) => void;
}) {
  const normalizedColor = normalizeHexColor(currentColor);

  return (
    <div className="absolute left-0 top-9 z-50 w-72 rounded-sm border border-slate-300 bg-white text-slate-950 shadow-lg dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50">
      <button
        className="flex w-full items-center gap-2 border-b border-slate-200 px-3 py-2 text-left text-xs hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-900"
        disabled={disabled}
        onClick={onClear}
        type="button"
      >
        <span
          aria-hidden="true"
          className="size-4 border border-slate-300 dark:border-slate-700"
          style={{ backgroundColor: automaticColor }}
        />
        <span>{automaticLabel}</span>
      </button>

      <div className="px-3 py-2">
        <p className="mb-2 text-xs font-semibold">Theme Colors</p>
        <div className="grid grid-cols-10 gap-1">
          {THEME_COLOR_COLUMNS.map((column) => (
            <ColorSwatch
              activeColor={normalizedColor}
              color={column.base}
              disabled={disabled}
              key={column.base}
              onSelect={onSelect}
            />
          ))}
          {THEME_COLOR_COLUMNS.map((column) =>
            column.shades.map((color) => (
              <ColorSwatch
                activeColor={normalizedColor}
                color={color}
                disabled={disabled}
                key={`${column.base}-${color}`}
                onSelect={onSelect}
              />
            )),
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 px-3 py-2 dark:border-slate-800">
        <p className="mb-2 text-xs font-semibold">Standard Colors</p>
        <div className="grid grid-cols-10 gap-1">
          {STANDARD_COLOR_OPTIONS.map((color) => (
            <ColorSwatch
              activeColor={normalizedColor}
              color={color}
              disabled={disabled}
              key={color}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorSwatch({
  activeColor,
  color,
  disabled,
  onSelect,
}: {
  activeColor: string;
  color: string;
  disabled?: boolean;
  onSelect: (color: string, options?: ColorSelectOptions) => void;
}) {
  const isActive = activeColor.toLowerCase() === color.toLowerCase();

  return (
    <button
      aria-label={`Text color ${color}`}
      aria-pressed={isActive}
      className={
        isActive
          ? "grid size-5 place-items-center border-2 border-orange-500 bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-950 dark:focus:ring-slate-300"
          : "grid size-5 place-items-center border border-slate-200 bg-white hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-300"
      }
      disabled={disabled}
      onClick={() => onSelect(color)}
      type="button"
    >
      <span className="size-full" style={{ backgroundColor: color }} />
    </button>
  );
}

function normalizeHexColor(color: string) {
  return /^#[0-9A-F]{6}$/i.test(color) ? color : DEFAULT_TEXT_COLOR;
}

function parseFontSizeValue(value: string) {
  return value.replace("px", "") || String(DEFAULT_FONT_SIZE);
}
