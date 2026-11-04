class Solution {
  reverseKGroup(head: ListNode | null, k: number): ListNode | null {
    const dummy = new ListNode(0)
    dummy.next = head
    let previousBlockEnd: ListNode = dummy

    while (true) {
      let probe: ListNode = previousBlockEnd
      for (let step = 0; step < k; step += 1) {
        if (probe.next === null) {
          return dummy.next
        }
        probe = probe.next
      }

      const nextBlockStart = probe.next
      let previous: ListNode | null = nextBlockStart
      let current: ListNode | null = previousBlockEnd.next

      while (current !== null && current !== nextBlockStart) {
        const following = current.next
        current.next = previous
        previous = current
        current = following
      }

      const oldBlockStart = previousBlockEnd.next
      previousBlockEnd.next = probe
      if (oldBlockStart === null) {
        return dummy.next
      }
      previousBlockEnd = oldBlockStart
    }
  }
}

export { Solution }
