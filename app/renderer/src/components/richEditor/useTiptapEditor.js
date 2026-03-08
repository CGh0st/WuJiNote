import { useEditor } from '@tiptap/vue-3'
import { StarterKit } from '@tiptap/starter-kit'
import ListItem from '@tiptap/extension-list-item'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import NodeRange from '@tiptap-pro/extension-node-range'
import OrderedList from '@tiptap/extension-ordered-list'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { TableOfContents, getHierarchicalIndexes } from '@tiptap-pro/extension-table-of-contents'
import { Highlight } from '@tiptap/extension-highlight'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Image } from '@tiptap/extension-image'
import { FileHandler } from '@tiptap-pro/extension-file-handler'
import Commands from './slashCommands/commands.js'
import suggestion from './slashCommands/suggestion.js'
import { updateToc } from './tocUtils.js'
import { all, createLowlight } from 'lowlight'

// Highlight.js languages
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import python from 'highlight.js/lib/languages/python'
import xml from 'highlight.js/lib/languages/xml'

// Configure lowlight
const lowlight = createLowlight(all)
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)
lowlight.register('py', python)
lowlight.register('python', python)
lowlight.register('vue', xml)

export function useTiptapEditor(props, emit, tocTree) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        levels: [1, 2, 3]
      }),
      ListItem,
      OrderedList,
      TaskList,
      Image,
      Highlight.configure({
        multicolor: true
      }),
      TaskItem.configure({
        nested: true
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript'
      }),
      NodeRange.configure({
        key: null
      }),
      Placeholder.configure({
        placeholder: '输入 / 唤起命令菜单...'
      }),
      TableOfContents.configure({
        getIndex: getHierarchicalIndexes,
        onUpdate: (items) => {
          tocTree.value = updateToc(items)
        }
      }),
      Commands.configure({
        suggestion
      }),
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        onDrop: (currentEditor, files, pos) => {
          files.forEach((file) => {
            const fileReader = new FileReader()

            fileReader.readAsDataURL(file)
            fileReader.onload = () => {
              currentEditor
                .chain()
                .insertContentAt(pos, {
                  type: 'image',
                  attrs: {
                    src: fileReader.result
                  }
                })
                .focus()
                .run()
            }
          })
        },
        onPaste: (currentEditor, files) => {
          files.forEach((file) => {
            const fileReader = new FileReader()

            fileReader.readAsDataURL(file)
            fileReader.onload = () => {
              currentEditor
                .chain()
                .insertContentAt(currentEditor.state.selection.anchor, {
                  type: 'image',
                  attrs: {
                    src: fileReader.result
                  }
                })
                .focus()
                .run()
            }
          })
        }
      })
    ],
    content: props.content,
    editable: false,
    onUpdate: ({ editor }) => {
      // You might want to emit an update event here if needed
      // emit('update:content', editor.getJSON())
      console.log(editor.getHTML())
    }
  })

  return editor
}
