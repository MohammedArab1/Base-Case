class RandomNode {
  value: number
  next: RandomNode | null = null
  random: RandomNode | null = null

  constructor(value: number) {
    this.value = value
  }
}

class Solution {
  copyRandomList(values: number[], random: number[]): number[][] {
    if (values.length === 0) {
      return []
    }

    const originals: RandomNode[] = values.map((value) => new RandomNode(value))
    for (let index = 0; index + 1 < originals.length; index += 1) {
      originals[index].next = originals[index + 1]
    }
    for (let index = 0; index < random.length; index += 1) {
      if (random[index] !== -1) {
        originals[index].random = originals[random[index]]
      }
    }

    const copies: RandomNode[] = values.map((value) => new RandomNode(value))
    for (let index = 0; index + 1 < copies.length; index += 1) {
      copies[index].next = copies[index + 1]
    }
    for (let index = 0; index < random.length; index += 1) {
      if (random[index] !== -1) {
        copies[index].random = copies[random[index]]
      }
    }

    const position = new Map<RandomNode, number>()
    for (let index = 0; index < copies.length; index += 1) {
      position.set(copies[index], index)
    }

    const result: number[][] = []
    let node: RandomNode | null = copies[0]
    while (node !== null) {
      const target = node.random === null ? -1 : (position.get(node.random) as number)
      result.push([node.value, target])
      node = node.next
    }

    return result
  }
}

export { Solution }
