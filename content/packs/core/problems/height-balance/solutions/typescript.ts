class Solution {
  isBalanced(root: TreeNode | null): boolean {
    if (!root) {
      return true
    }

    const heights = new Map<TreeNode, number>()
    const stack: Array<[TreeNode | null, boolean]> = [[root, false]]

    while (stack.length > 0) {
      const [node, visited] = stack.pop() as [TreeNode | null, boolean]

      if (!node) {
        continue
      }

      if (visited) {
        const left = node.left ? (heights.get(node.left) ?? 0) : 0
        const right = node.right ? (heights.get(node.right) ?? 0) : 0

        if (Math.abs(left - right) > 1) {
          return false
        }

        heights.set(node, 1 + Math.max(left, right))
      } else {
        stack.push([node, true])
        stack.push([node.left, false])
        stack.push([node.right, false])
      }
    }

    return true
  }
}

export { Solution }
