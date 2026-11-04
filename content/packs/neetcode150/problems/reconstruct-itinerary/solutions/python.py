from collections import defaultdict


class Solution:
    def reconstructItinerary(self, tickets: list[list[str]]) -> list[str]:
        graph = defaultdict(list)

        for source, destination in sorted(tickets, reverse=True):
            graph[source].append(destination)

        route = []

        def visit(airport: str) -> None:
            while graph[airport]:
                visit(graph[airport].pop())
            route.append(airport)

        visit("JFK")
        route.reverse()
        return route
