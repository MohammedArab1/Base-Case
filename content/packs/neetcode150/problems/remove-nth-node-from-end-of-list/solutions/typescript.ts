class Solution {
  removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
    const dummy = new ListNode(0)
    dummy.next = head
    let lead: ListNode | null = dummy
    let trail: ListNode = dummy

    for (let step = 0; step <= n; step += 1) {
      lead = lead === null ? null : lead.next
    }

    while (lead !== null) {
      lead = lead.next
      trail = trail.next as ListNode
    }

    if (trail.next !== null) {
      trail.next = trail.next.next
    }

    return dummy.next
  }
}

export { Solution }
