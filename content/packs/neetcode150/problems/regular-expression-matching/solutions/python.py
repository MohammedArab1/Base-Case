class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        string_length = len(s)
        pattern_length = len(p)
        dp = [
            [False] * (pattern_length + 1)
            for _ in range(string_length + 1)
        ]
        dp[0][0] = True

        for pattern_index in range(2, pattern_length + 1):
            if p[pattern_index - 1] == "*":
                dp[0][pattern_index] = dp[0][pattern_index - 2]

        for string_index in range(1, string_length + 1):
            for pattern_index in range(1, pattern_length + 1):
                if p[pattern_index - 1] == "*":
                    dp[string_index][pattern_index] = dp[string_index][pattern_index - 2]
                    previous = p[pattern_index - 2]
                    if previous == "." or previous == s[string_index - 1]:
                        dp[string_index][pattern_index] = (
                            dp[string_index][pattern_index]
                            or dp[string_index - 1][pattern_index]
                        )
                else:
                    current = p[pattern_index - 1]
                    if current == "." or current == s[string_index - 1]:
                        dp[string_index][pattern_index] = dp[string_index - 1][pattern_index - 1]

        return dp[string_length][pattern_length]
