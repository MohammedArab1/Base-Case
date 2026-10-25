class Solution {
  isSearchTree(root: TreeNode | null): boolean {
    const valid = (node: TreeNode | null, low: number, high: number): boolean => {
      if (!node) {
        return true
      }

      if (node.val <= low || node.val >= high) {
        return false
      }

      return valid(node.left, low, node.val) && valid(node.right, node.val, high)
    }

    return valid(root, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
  }
}

export { Solution }
