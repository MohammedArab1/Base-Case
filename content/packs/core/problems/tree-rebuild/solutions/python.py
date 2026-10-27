from typing import List


class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> TreeNode:
        root = TreeNode(preorder[0])
        stack = [root]
        in_index = 0

        for value in preorder[1:]:
            node = TreeNode(value)

            if stack[-1].val != inorder[in_index]:
                stack[-1].left = node
            else:
                while stack and stack[-1].val == inorder[in_index]:
                    last = stack.pop()
                    in_index += 1

                last.right = node

            stack.append(node)

        return root
