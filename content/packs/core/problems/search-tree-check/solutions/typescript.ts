class Solution {
  isSearchTree(root: TreeNode | null): boolean {
    if (!root) {
      return true
    }

    const stack: Array<[TreeNode, number, number]> = [
      [root, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
    ]

    while (stack.length > 0) {
      const [node, low, high] = stack.pop() as [TreeNode, number, number]

      if (node.val <= low || node.val >= high) {
        return false
      }

      if (node.left) {
        stack.push([node.left, low, node.val])
      }
      if (node.right) {
        stack.push([node.right, node.val, high])
      }
    }

    return true
  }
}

export { Solution }
