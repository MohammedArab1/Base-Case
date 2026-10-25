class Solution:
    def minEdits(self, source: str, target: str) -> int:
        previous = list(range(len(target) + 1))

        for source_index, source_char in enumerate(source, start=1):
            current = [source_index] + [0] * len(target)

            for target_index, target_char in enumerate(target, start=1):
                if source_char == target_char:
                    current[target_index] = previous[target_index - 1]
                else:
                    current[target_index] = 1 + min(
                        previous[target_index],
                        current[target_index - 1],
                        previous[target_index - 1],
                    )

            previous = current

        return previous[-1]
