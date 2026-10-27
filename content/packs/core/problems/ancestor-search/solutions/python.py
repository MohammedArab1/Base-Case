class Solution:
    def lowestAncestor(self, root: TreeNode, first: int, second: int) -> int:
        node = root

        while node:
            if first < node.val and second < node.val:
                node = node.left
            elif first > node.val and second > node.val:
                node = node.right
            else:
                return node.val

        return -1
