import { Extension } from '@tiptap/core'

export const KeyboardShortcutsExtension = Extension.create({
  name: 'customKeyboardShortcuts',

  addKeyboardShortcuts() {
    return {
      // Highlight: Cmd+Shift+H
      'Mod-Shift-H': () => this.editor.commands.toggleHighlight(),

      // Underline: Cmd+U
      'Mod-u': () => this.editor.commands.toggleUnderline(),

      // Strikethrough: Cmd+Shift+X (alternative plus fiable)
      'Mod-Shift-X': () => this.editor.commands.toggleStrike(),

      // Heading shortcuts: Cmd+1, Cmd+2, Cmd+3
      'Mod-1': () => this.editor.commands.toggleHeading({ level: 1 }),
      'Mod-2': () => this.editor.commands.toggleHeading({ level: 2 }),
      'Mod-3': () => this.editor.commands.toggleHeading({ level: 3 }),
      'Mod-4': () => this.editor.commands.toggleHeading({ level: 4 }),

      // Return to paragraph: Cmd+0
      'Mod-0': () => this.editor.commands.setParagraph(),

      // Code block: Cmd+Shift+C
      'Mod-Shift-C': () => this.editor.commands.toggleCodeBlock(),

      // Blockquote: Cmd+Shift+Q
      'Mod-Shift-Q': () => this.editor.commands.toggleBlockquote(),

      // Bullet list: Cmd+Shift+U
      'Mod-Shift-U': () => this.editor.commands.toggleBulletList(),

      // Ordered list: Cmd+Shift+O
      'Mod-Shift-O': () => this.editor.commands.toggleOrderedList(),

      // Task list: Cmd+Shift+T (désactivé car conflit avec typewriter)
      // 'Mod-Shift-T': () => this.editor.commands.toggleTaskList(),

      // Horizontal rule: Cmd+Enter
      'Mod-Shift--': () => this.editor.commands.setHorizontalRule(),

      // Text alignment
      'Mod-Shift-l': () => this.editor.commands.setTextAlign('left'),
      'Mod-Shift-e': () => this.editor.commands.setTextAlign('center'),
      'Mod-Shift-r': () => this.editor.commands.setTextAlign('right'),
      'Mod-Shift-j': () => this.editor.commands.setTextAlign('justify'),
    }
  },
})
