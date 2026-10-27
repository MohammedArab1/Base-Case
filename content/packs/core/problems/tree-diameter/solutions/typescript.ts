class Solution {
  diameter(root: TreeNode | null): number {
    if (!root) {
      return 0
    }

    const heights = new Map<TreeNode, number>()
    const stack: Array<[TreeNode | null, boolean]> = [[root, false]]
    let best = 0

    while (stack.length > 0) {
      const [node, visited] = stack.pop() as [TreeNode | null, boolean]

      if (!node) {
        continue
      }

      if (visited) {
        const left = node.left ? (heights.get(node.left) ?? 0) : 0
        const right = node.right ? (heights.get(node.right) ?? 0) : 0
        best = Math.max(best, left + right)
        heights.set(node, 1 + Math.max(left, right))
      } else {
        stack.push([node, true])
        stack.push([node.left, false])
        stack.push([node.right, false])
      }
    }

    return best
  }
}

export { Solution }
