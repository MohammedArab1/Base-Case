class Solution {
  invertTree(root: TreeNode | null): TreeNode | null {
    if (!root) {
      return null
    }

    const stack: TreeNode[] = [root]

    while (stack.length > 0) {
      const node = stack.pop() as TreeNode
      const left = node.left
      node.left = node.right
      node.right = left

      if (node.left) {
        stack.push(node.left)
      }
      if (node.right) {
        stack.push(node.right)
      }
    }

    return root
  }
}

export { Solution }
