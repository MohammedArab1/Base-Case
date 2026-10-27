class Solution {
  maxDepth(root: TreeNode | null): number {
    if (!root) {
      return 0
    }

    let best = 0
    const stack: Array<[TreeNode, number]> = [[root, 1]]

    while (stack.length > 0) {
      const [node, depth] = stack.pop() as [TreeNode, number]
      best = Math.max(best, depth)

      if (node.left) {
        stack.push([node.left, depth + 1])
      }
      if (node.right) {
        stack.push([node.right, depth + 1])
      }
    }

    return best
  }
}

export { Solution }
