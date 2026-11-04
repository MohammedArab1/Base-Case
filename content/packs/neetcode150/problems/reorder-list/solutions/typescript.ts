class Solution {
  reorderList(head: ListNode | null): ListNode | null {
    if (!head || !head.next) {
      return head
    }

    let slow: ListNode = head
    let fast: ListNode = head
    while (fast.next !== null && fast.next.next !== null) {
      slow = slow.next as ListNode
      fast = fast.next.next
    }

    let second: ListNode | null = slow.next
    slow.next = null

    let previous: ListNode | null = null
    while (second !== null) {
      const following = second.next
      second.next = previous
      previous = second
      second = following
    }

    let first: ListNode | null = head
    second = previous
    while (second !== null && first !== null) {
      const firstNext = first.next
      const secondNext = second.next
      first.next = second
      second.next = firstNext
      first = firstNext
      second = secondNext
    }

    return head
  }
}

export { Solution }
