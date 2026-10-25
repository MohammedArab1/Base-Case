class Solution:
    def reverseChain(self, head: ListNode) -> ListNode:
        previous = None
        current = head

        while current:
            following = current.next
            current.next = previous
            previous = current
            current = following

        return previous
