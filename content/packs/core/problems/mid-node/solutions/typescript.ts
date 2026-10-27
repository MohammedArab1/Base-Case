class Solution {
  middleNode(head: ListNode | null): ListNode | null {
    let slow = head
    let fast = head

    while (fast && fast.next) {
      slow = slow ? slow.next : null
      fast = fast.next.next
    }

    return slow
  }
}

export { Solution }
