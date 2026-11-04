class Solution {
  reconstructItinerary(tickets: string[][]): string[] {
    const graph = new Map<string, string[]>()
    const sorted = tickets
      .map((ticket) => [ticket[0], ticket[1]] as [string, string])
      .sort((left, right) => {
        if (left[0] !== right[0]) return left[0] < right[0] ? 1 : -1
        if (left[1] !== right[1]) return left[1] < right[1] ? 1 : -1
        return 0
      })

    for (const [source, destination] of sorted) {
      const destinations = graph.get(source)
      if (destinations) destinations.push(destination)
      else graph.set(source, [destination])
    }

    const route: string[] = []
    const visit = (airport: string): void => {
      const destinations = graph.get(airport)
      while (destinations && destinations.length > 0) {
        visit(destinations.pop() as string)
      }
      route.push(airport)
    }

    visit('JFK')
    route.reverse()
    return route
  }
}

export { Solution }
