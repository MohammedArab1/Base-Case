class Solution:
    def isSubtree(self, root: TreeNode, subRoot: TreeNode) -> bool:
        def identical(a: TreeNode, b: TreeNode) -> bool:
            pairs = [(a, b)]
            while pairs:
                left, right = pairs.pop()
                if not left and not right:
                    continue
                if not left or not right:
                    return False
                if left.val != right.val:
                    return False
                pairs.append((left.left, right.left))
                pairs.append((left.right, right.right))
            return True

        if not subRoot:
            return True
        if not root:
            return False

        candidates = [root]
        while candidates:
            node = candidates.pop()
            if not node:
                continue
            if identical(node, subRoot):
                return True
            candidates.append(node.left)
            candidates.append(node.right)

        return False
