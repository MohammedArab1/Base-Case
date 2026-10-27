class Solution {
  hasCycle(values: number[], linkIndex: number): boolean {
    if (values.length === 0) {
      return false
    }

    const nodes = values.map((value) => new ListNode(value))

    for (let index = 0; index + 1 < nodes.length; index += 1) {
      nodes[index].next = nodes[index + 1]
    }

    if (linkIndex >= 0) {
      nodes[nodes.length - 1].next = nodes[linkIndex]
    }

    let slow: ListNode | null = nodes[0]
    let fast: ListNode | null = nodes[0]

    while (fast && fast.next) {
      slow = slow.next
      fast = fast.next.next

      if (slow === fast) {
        return true
      }
    }

    return false
  }
}

export { Solution }
