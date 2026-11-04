class Solution:
    def reverseKGroup(self, head: ListNode, k: int) -> ListNode:
        dummy = ListNode(0)
        dummy.next = head
        previous_block_end = dummy

        while True:
            probe = previous_block_end
            for _ in range(k):
                probe = probe.next
                if not probe:
                    return dummy.next

            next_block_start = probe.next
            previous = next_block_start
            current = previous_block_end.next

            while current is not next_block_start:
                following = current.next
                current.next = previous
                previous = current
                current = following

            old_block_start = previous_block_end.next
            previous_block_end.next = probe
            previous_block_end = old_block_start
