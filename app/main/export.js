import { BrowserWindow, app, dialog } from 'electron'
import fs from 'fs'
import { join } from 'path'
import { getNoteById } from './curd'

export async function handleExportNote(event, noteId, format) {
  const mainWindow = BrowserWindow.fromWebContents(event.sender)
  try {
    const note = getNoteById(noteId)
    if (!note) {
      throw new Error('笔记不存在')
    }

    let content = note.content || ''
    let defaultPath = `${note.title || '未命名笔记'}`

    if (format === 'markdown') {
      const TurndownService = require('turndown')
      const turndownService = new TurndownService()
      // 配置 turndown 保留一些标签或者自定义规则
      turndownService.addRule('strikethrough', {
        filter: ['del', 's', 'strike'],
        replacement: function (content) {
          return '~' + content + '~'
        }
      })
      const markdown = turndownService.turndown(content)

      const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: '导出为 Markdown',
        defaultPath: `${defaultPath}.md`,
        filters: [{ name: 'Markdown', extensions: ['md'] }]
      })

      if (filePath) {
        fs.writeFileSync(filePath, markdown)
        return true
      }
    } else if (format === 'word') {
      const htmlToDocx = require('html-to-docx')

      // 构建完整的 HTML 文档结构，确保 html-to-docx 能正确解析
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body>
            <h1>${note.title}</h1>
            ${content}
          </body>
        </html>
      `

      const fileBuffer = await htmlToDocx(htmlContent, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
        title: note.title
      })

      const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: '导出为 Word',
        defaultPath: `${defaultPath}.docx`,
        filters: [{ name: 'Word Document', extensions: ['docx'] }]
      })

      if (filePath) {
        fs.writeFileSync(filePath, fileBuffer)
        return true
      }
    } else if (format === 'pdf') {
      // 创建隐藏窗口渲染 HTML
      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      try {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: "Microsoft YaHei", sans-serif; padding: 40px; }
                img { max-width: 100%; }
                h1 { text-align: center; margin-bottom: 30px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; }
                blockquote { border-left: 4px solid #ddd; padding-left: 10px; color: #666; margin: 0; }
                pre { background: #f4f4f4; padding: 10px; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; }
              </style>
            </head>
            <body>
              <h1>${note.title}</h1>
              ${content}
            </body>
          </html>
        `

        const tempHtmlPath = join(app.getPath('temp'), `temp_note_export_${Date.now()}.html`)
        fs.writeFileSync(tempHtmlPath, htmlContent)

        await printWindow.loadFile(tempHtmlPath)

        const { filePath } = await dialog.showSaveDialog(mainWindow, {
          title: '导出为 PDF',
          defaultPath: `${defaultPath}.pdf`,
          filters: [{ name: 'PDF Document', extensions: ['pdf'] }]
        })

        if (filePath) {
          const pdfData = await printWindow.webContents.printToPDF({
            printBackground: true,
            pageSize: 'A4',
            margins: {
              top: 1,
              bottom: 1,
              left: 1,
              right: 1
            }
          })
          fs.writeFileSync(filePath, pdfData)

          // 清理临时文件
          try {
            fs.unlinkSync(tempHtmlPath)
          } catch (e) {
            console.error('Failed to delete temp file:', e)
          }

          return true
        }

        // 如果用户取消，也要清理临时文件
        try {
          fs.unlinkSync(tempHtmlPath)
        } catch (e) {
          console.error('Failed to delete temp file:', e)
        }
      } finally {
        printWindow.close()
      }
    }

    return false
  } catch (error) {
    console.error('Export error:', error)
    throw error
  }
}
