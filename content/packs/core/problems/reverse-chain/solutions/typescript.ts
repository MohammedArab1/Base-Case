class Solution {
  reverseChain(head: ListNode | null): ListNode | null {
    let previous: ListNode | null = null
    let current = head

    while (current) {
      const following = current.next
      current.next = previous
      previous = current
      current = following
    }

    return previous
  }
}

export { Solution }
