from typing import List


class Solution:
    def hasCycle(self, values: List[int], linkIndex: int) -> bool:
        if not values:
            return False

        nodes = [ListNode(value) for value in values]

        for index in range(len(nodes) - 1):
            nodes[index].next = nodes[index + 1]

        if linkIndex >= 0:
            nodes[-1].next = nodes[linkIndex]

        slow = nodes[0]
        fast = nodes[0]

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

            if slow is fast:
                return True

        return False
