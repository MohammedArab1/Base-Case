class Solution {
  isSymmetric(root: TreeNode | null): boolean {
    if (!root) {
      return true
    }

    const queue: Array<[TreeNode | null, TreeNode | null]> = [[root.left, root.right]]

    for (let index = 0; index < queue.length; index += 1) {
      const pair = queue[index]

      if (!pair) {
        continue
      }

      const [left, right] = pair

      if (!left && !right) {
        continue
      }
      if (!left || !right) {
        return false
      }
      if (left.val !== right.val) {
        return false
      }

      queue.push([left.left, right.right])
      queue.push([left.right, right.left])
    }

    return true
  }
}

export { Solution }
