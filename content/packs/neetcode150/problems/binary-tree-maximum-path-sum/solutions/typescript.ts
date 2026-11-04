class Solution {
  maxPathSum(root: TreeNode | null): number {
    let best = Number.NEGATIVE_INFINITY
    const gains = new Map<TreeNode, number>()
    const stack: Array<[TreeNode, boolean]> = root === null ? [] : [[root, false]]

    while (stack.length > 0) {
      const entry = stack.pop() as [TreeNode, boolean]
      const node = entry[0]
      const visited = entry[1]

      if (visited) {
        const leftGain = node.left === null ? 0 : (gains.get(node.left) ?? 0)
        const rightGain = node.right === null ? 0 : (gains.get(node.right) ?? 0)
        const left = Math.max(leftGain, 0)
        const right = Math.max(rightGain, 0)
        best = Math.max(best, node.val + left + right)
        gains.set(node, node.val + Math.max(left, right))
        continue
      }

      stack.push([node, true])
      if (node.right !== null) {
        stack.push([node.right, false])
      }
      if (node.left !== null) {
        stack.push([node.left, false])
      }
    }

    return best
  }
}

export { Solution }
