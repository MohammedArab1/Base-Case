class Solution:
    def reorderList(self, head: ListNode) -> ListNode:
        if not head or not head.next:
            return head

        slow = head
        fast = head
        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next

        second = slow.next
        slow.next = None

        previous = None
        while second:
            following = second.next
            second.next = previous
            previous = second
            second = following

        first = head
        second = previous
        while second:
            first_next = first.next
            second_next = second.next
            first.next = second
            second.next = first_next
            first = first_next
            second = second_next

        return head
