class Solution {
  buildTree(preorder: number[], inorder: number[]): TreeNode {
    const root = new TreeNode(preorder[0])
    const stack: TreeNode[] = [root]
    let inIndex = 0

    for (let index = 1; index < preorder.length; index += 1) {
      const node = new TreeNode(preorder[index])

      if (stack[stack.length - 1].val !== inorder[inIndex]) {
        stack[stack.length - 1].left = node
      } else {
        let last: TreeNode | null = null

        while (stack.length > 0 && stack[stack.length - 1].val === inorder[inIndex]) {
          last = stack.pop() as TreeNode
          inIndex += 1
        }

        if (last) {
          last.right = node
        }
      }

      stack.push(node)
    }

    return root
  }
}

export { Solution }
