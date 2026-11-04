class Solution:
    def removeNthFromEnd(self, head: ListNode, n: int) -> ListNode:
        dummy = ListNode(0)
        dummy.next = head
        lead = dummy
        trail = dummy

        for _ in range(n + 1):
            lead = lead.next

        while lead:
            lead = lead.next
            trail = trail.next

        trail.next = trail.next.next
        return dummy.next
