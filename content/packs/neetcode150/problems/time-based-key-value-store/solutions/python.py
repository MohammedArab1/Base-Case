class Solution:
    def timeMap(
        self,
        operations: list[str],
        keys: list[str],
        values: list[str],
        times: list[int],
    ) -> list[str]:
        history: dict[str, list[tuple[int, str]]] = {}
        answers: list[str] = []

        for operation, key, value, time in zip(operations, keys, values, times):
            if operation == "set":
                history.setdefault(key, []).append((time, value))
            else:
                records = history.get(key)
                if not records:
                    answers.append("")
                    continue

                low = 0
                high = len(records)
                while low < high:
                    mid = (low + high) // 2
                    if records[mid][0] <= time:
                        low = mid + 1
                    else:
                        high = mid

                answers.append(records[low - 1][1] if low > 0 else "")

        return answers
