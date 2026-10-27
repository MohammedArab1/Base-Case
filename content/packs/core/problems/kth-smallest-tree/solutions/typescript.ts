class Solution {
  kthSmallest(root: TreeNode | null, k: number): number {
    const stack: TreeNode[] = []
    let node = root
    let remaining = k

    while (stack.length > 0 || node) {
      while (node) {
        stack.push(node)
        node = node.left
      }

      node = stack.pop() as TreeNode
      remaining -= 1

      if (remaining === 0) {
        return node.val
      }

      node = node.right
    }

    return -1
  }
}

export { Solution }
