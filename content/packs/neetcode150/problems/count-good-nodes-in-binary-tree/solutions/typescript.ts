class Solution {
  goodNodes(root: TreeNode | null): number {
    if (root === null) {
      return 0
    }

    let count = 0
    const stack: Array<[TreeNode, number]> = [[root, root.val]]

    while (stack.length > 0) {
      const entry = stack.pop() as [TreeNode, number]
      const node = entry[0]
      const maximum = entry[1]

      if (node.val >= maximum) {
        count += 1
      }

      const nextMaximum = Math.max(maximum, node.val)
      if (node.left !== null) {
        stack.push([node.left, nextMaximum])
      }
      if (node.right !== null) {
        stack.push([node.right, nextMaximum])
      }
    }

    return count
  }
}

export { Solution }
