class Solution {
  lowestCommonAncestor(root: TreeNode | null, first: number, second: number): number {
    if (!root) {
      return -1
    }

    const parents = new Map<number, number | null>([[root.val, null]])
    const stack: TreeNode[] = [root]

    while (stack.length > 0) {
      const node = stack.pop() as TreeNode

      if (node.left) {
        parents.set(node.left.val, node.val)
        stack.push(node.left)
      }
      if (node.right) {
        parents.set(node.right.val, node.val)
        stack.push(node.right)
      }
    }

    const seen = new Set<number>()
    let value: number | null = first

    while (value !== null) {
      seen.add(value)
      value = parents.get(value) ?? null
    }

    value = second

    while (value !== null && !seen.has(value)) {
      value = parents.get(value) ?? null
    }

    return value ?? -1
  }
}

export { Solution }
