class Solution:
    def leastInterval(self, tasks: str, cooldown: int) -> int:
        counts = [0] * 26

        for task in tasks:
            counts[ord(task) - ord("A")] += 1

        maximum = max(counts)
        tied = sum(1 for count in counts if count == maximum)
        frame = (maximum - 1) * (cooldown + 1) + tied

        return max(frame, len(tasks))
