import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'

import commandsList from './commandsList.vue'

export default {
  items: ({ query }) => {
    return [
      {
        type: 1,
        title: '一级标题',
        iconName: 'icon-h1',
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
        }
      },
      {
        type: 1,
        title: '二级标题',
        iconName: 'icon-h2',
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
        }
      },
      {
        type: 1,
        title: '三级标题',
        iconName: 'icon-h3',
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
        }
      },
      {
        type: 1,
        title: '正文段落',
        iconName: 'icon-align-left',
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setNode('paragraph').run()
        }
      },
      {
        type: 1,
        title: '代码块',
        iconName: 'icon-code',
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
        }
      },
      {
        type: 1,
        title: '无序列表',
        iconName: 'icon-unordered-list',
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run()
        }
      },
      {
        type: 1,
        title: '有序列表',
        iconName: 'icon-ordered-list',
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run()
        }
      },
      { type: 0, title: '' },
      {
        type: 1,
        title: '加粗',
        iconName: 'icon-bold',
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setMark('bold').run()
        }
      },
      {
        type: 1,
        title: '斜体',
        iconName: 'icon-italic',
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setMark('italic').run()
        }
      },
      {
        type: 1,
        title: '划线',
        iconName: 'icon-strikethrough',
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setMark('strike').run()
        }
      }
    ]
      .filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 15)
  },

  render: () => {
    let component
    let popup

    return {
      onStart: (props) => {
        component = new VueRenderer(commandsList, {
          props,
          editor: props.editor
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start'
        })
      },

      onUpdate(props) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup[0].hide()
          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        popup[0].destroy()
        component.destroy()
      }
    }
  }
}
