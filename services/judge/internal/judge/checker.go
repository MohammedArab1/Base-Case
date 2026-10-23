package judge

import (
	"encoding/json"
	"fmt"
	"math"
	"reflect"
	"sort"
)

func compareValues(expected, actual json.RawMessage, checker Checker) (bool, error) {
	var expectedValue any
	if err := json.Unmarshal(expected, &expectedValue); err != nil {
		return false, fmt.Errorf("decode expected value: %w", err)
	}

	var actualValue any
	if err := json.Unmarshal(actual, &actualValue); err != nil {
		return false, fmt.Errorf("decode actual value: %w", err)
	}

	switch checker.Kind {
	case "", "exact":
		return reflect.DeepEqual(expectedValue, actualValue), nil
	case "unordered":
		return compareUnordered(expectedValue, actualValue), nil
	case "float":
		absoluteTolerance := 1e-5
		if checker.AbsoluteTolerance != nil {
			absoluteTolerance = *checker.AbsoluteTolerance
		}
		relativeTolerance := 1e-5
		if checker.RelativeTolerance != nil {
			relativeTolerance = *checker.RelativeTolerance
		}
		return compareFloat(expectedValue, actualValue, absoluteTolerance, relativeTolerance), nil
	case "set-of-sets":
		return compareSetOfSets(expectedValue, actualValue), nil
	default:
		return false, fmt.Errorf("unsupported checker %q", checker.Kind)
	}
}

func compareUnordered(expected, actual any) bool {
	expectedItems, expectedOK := expected.([]any)
	actualItems, actualOK := actual.([]any)

	if !expectedOK || !actualOK || len(expectedItems) != len(actualItems) {
		return false
	}

	expectedKeys := make([]string, 0, len(expectedItems))
	actualKeys := make([]string, 0, len(actualItems))

	for _, item := range expectedItems {
		key, err := json.Marshal(item)
		if err != nil {
			return false
		}
		expectedKeys = append(expectedKeys, string(key))
	}

	for _, item := range actualItems {
		key, err := json.Marshal(item)
		if err != nil {
			return false
		}
		actualKeys = append(actualKeys, string(key))
	}

	sort.Strings(expectedKeys)
	sort.Strings(actualKeys)

	return reflect.DeepEqual(expectedKeys, actualKeys)
}

func compareSetOfSets(expected, actual any) bool {
	expectedSets, expectedOK := expected.([]any)
	actualSets, actualOK := actual.([]any)

	if !expectedOK || !actualOK || len(expectedSets) != len(actualSets) {
		return false
	}

	canonicalize := func(sets []any) ([]string, bool) {
		result := make([]string, 0, len(sets))

		for _, set := range sets {
			items, ok := set.([]any)
			if !ok {
				return nil, false
			}

			keys := make([]string, 0, len(items))
			for _, item := range items {
				key, err := json.Marshal(item)
				if err != nil {
					return nil, false
				}
				keys = append(keys, string(key))
			}

			sort.Strings(keys)
			encoded, err := json.Marshal(keys)
			if err != nil {
				return nil, false
			}
			result = append(result, string(encoded))
		}

		return result, true
	}

	expectedKeys, ok := canonicalize(expectedSets)
	if !ok {
		return false
	}
	actualKeys, ok := canonicalize(actualSets)
	if !ok {
		return false
	}

	sort.Strings(expectedKeys)
	sort.Strings(actualKeys)

	return reflect.DeepEqual(expectedKeys, actualKeys)
}

func compareFloat(expected, actual any, absoluteTolerance, relativeTolerance float64) bool {
	switch expectedValue := expected.(type) {
	case float64:
		actualValue, ok := actual.(float64)
		if !ok {
			return false
		}
		if math.IsNaN(expectedValue) || math.IsNaN(actualValue) {
			return math.IsNaN(expectedValue) && math.IsNaN(actualValue)
		}
		difference := math.Abs(expectedValue - actualValue)
		scale := math.Max(math.Abs(expectedValue), math.Abs(actualValue))
		return difference <= absoluteTolerance+relativeTolerance*scale
	case []any:
		actualValue, ok := actual.([]any)
		if !ok || len(expectedValue) != len(actualValue) {
			return false
		}
		for index := range expectedValue {
			if !compareFloat(expectedValue[index], actualValue[index], absoluteTolerance, relativeTolerance) {
				return false
			}
		}
		return true
	case map[string]any:
		actualValue, ok := actual.(map[string]any)
		if !ok || len(expectedValue) != len(actualValue) {
			return false
		}
		for key, value := range expectedValue {
			actualItem, exists := actualValue[key]
			if !exists || !compareFloat(value, actualItem, absoluteTolerance, relativeTolerance) {
				return false
			}
		}
		return true
	default:
		return reflect.DeepEqual(expected, actual)
	}
}
