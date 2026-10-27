class Solution {
  lowestAncestor(root: TreeNode | null, first: number, second: number): number {
    let node = root

    while (node) {
      if (first < node.val && second < node.val) {
        node = node.left
      } else if (first > node.val && second > node.val) {
        node = node.right
      } else {
        return node.val
      }
    }

    return -1
  }
}

export { Solution }
