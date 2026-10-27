class Solution {
  rightSideView(root: TreeNode | null): number[] {
    if (!root) {
      return []
    }

    const result: number[] = []
    let current: TreeNode[] = [root]

    while (current.length > 0) {
      result.push(current[current.length - 1].val)
      const nextLevel: TreeNode[] = []

      for (const node of current) {
        if (node.left) {
          nextLevel.push(node.left)
        }
        if (node.right) {
          nextLevel.push(node.right)
        }
      }

      current = nextLevel
    }

    return result
  }
}

export { Solution }
