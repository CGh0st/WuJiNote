const buildTocTree = (tocList) => {
  const tree = [] // 最终的树形结构
  const stack = [] // 辅助栈，用来跟踪当前父节点

  tocList.forEach((item) => {
    const node = {
      ...item,
      children: [] // 确保每个节点都有 children 属性
    }

    // 如果栈为空或当前节点的 level > 栈顶节点的 level
    if (stack.length === 0 || item.level > stack[stack.length - 1].level) {
      if (stack.length > 0) {
        // 添加为栈顶节点的子节点
        stack[stack.length - 1].children.push(node)
      } else {
        // 添加为根节点
        tree.push(node)
      }
      stack.push(node) // 将当前节点推入栈中
    } else {
      // 当前节点的 level 小于或等于栈顶节点的 level
      while (stack.length > 0 && item.level <= stack[stack.length - 1].level) {
        stack.pop() // 弹出栈顶节点
      }
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(node)
      } else {
        tree.push(node) // 如果栈为空，添加为根节点
      }
      stack.push(node) // 将当前节点推入栈中
    }
  })
  return tree
}

/*
export const updateActiveLink = (tocTree) => {
  const headingList = tocTree.value.flatMap((node) => [node, ...(node.children || [])])
  let lastVisibleHeading = null

  for (const heading in headingList) {
    const element = document.getElementById(heading.id)
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top <= 150 && rect.bottom > 0) {
        lastVisibleHeading = heading
      }
    }
  }

  if (lastVisibleHeading) {
    activeLink.value = `#${lastVisibleHeading.id}`
  }
}
*/

export const updateToc = (content) => {
  let tocList = []
  if (Array.isArray(content)) {
    content.map((value) => {
      if (value.textContent) {
        tocList.push({
          id: value.id,
          content: value.textContent,
          level: value.level,
          isScrolledOver: value.isScrolledOver
        })
      }
    })
  }
  return buildTocTree(tocList)
}
