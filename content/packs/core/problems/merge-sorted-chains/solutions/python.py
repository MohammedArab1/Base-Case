class Solution:
    def mergeChains(self, first: ListNode, second: ListNode) -> ListNode:
        dummy = ListNode(0)
        tail = dummy

        while first and second:
            if first.val <= second.val:
                tail.next = first
                first = first.next
            else:
                tail.next = second
                second = second.next
            tail = tail.next

        tail.next = first or second
        return dummy.next
