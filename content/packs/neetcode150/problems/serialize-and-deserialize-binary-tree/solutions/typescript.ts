class Solution {
  serializeTree(root: TreeNode | null): string {
    const tokens: string[] = []
    const stack: Array<TreeNode | null> = [root]

    while (stack.length > 0) {
      const node = stack.pop()
      if (!node) {
        tokens.push('#')
        continue
      }
      tokens.push(String(node.val))
      stack.push(node.right)
      stack.push(node.left)
    }

    return tokens.join(',')
  }
}

export { Solution }
