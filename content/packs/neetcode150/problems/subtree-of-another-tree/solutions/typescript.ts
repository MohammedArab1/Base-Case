class Solution {
  isSubtree(root: TreeNode | null, subRoot: TreeNode | null): boolean {
    if (subRoot === null) {
      return true
    }
    if (root === null) {
      return false
    }

    const candidates: Array<TreeNode | null> = [root]
    while (candidates.length > 0) {
      const node = candidates.pop()
      if (!node) {
        continue
      }
      if (this.identical(node, subRoot)) {
        return true
      }
      candidates.push(node.left)
      candidates.push(node.right)
    }

    return false
  }

  private identical(a: TreeNode | null, b: TreeNode | null): boolean {
    const pairs: Array<[TreeNode | null, TreeNode | null]> = [[a, b]]

    while (pairs.length > 0) {
      const pair = pairs.pop() as [TreeNode | null, TreeNode | null]
      const left = pair[0]
      const right = pair[1]

      if (left === null && right === null) {
        continue
      }
      if (left === null || right === null) {
        return false
      }
      if (left.val !== right.val) {
        return false
      }

      pairs.push([left.left, right.left])
      pairs.push([left.right, right.right])
    }

    return true
  }
}

export { Solution }
