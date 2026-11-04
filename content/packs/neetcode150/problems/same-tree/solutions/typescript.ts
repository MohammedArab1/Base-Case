class Solution {
  isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
    const stack: Array<[TreeNode | null, TreeNode | null]> = [[p, q]]

    while (stack.length > 0) {
      const pair = stack.pop() as [TreeNode | null, TreeNode | null]
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

      stack.push([left.left, right.left])
      stack.push([left.right, right.right])
    }

    return true
  }
}

export { Solution }
