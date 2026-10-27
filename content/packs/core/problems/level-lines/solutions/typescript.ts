class Solution {
  levelOrder(root: TreeNode | null): number[][] {
    if (!root) {
      return []
    }

    const result: number[][] = []
    let current: TreeNode[] = [root]

    while (current.length > 0) {
      const values: number[] = []
      const nextLevel: TreeNode[] = []

      for (const node of current) {
        values.push(node.val)

        if (node.left) {
          nextLevel.push(node.left)
        }
        if (node.right) {
          nextLevel.push(node.right)
        }
      }

      result.push(values)
      current = nextLevel
    }

    return result
  }
}

export { Solution }
