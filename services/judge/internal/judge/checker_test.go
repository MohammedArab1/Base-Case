package judge

import (
	"encoding/json"
	"testing"
)

func TestExactChecker(t *testing.T) {
	passed, err := compareValues(
		json.RawMessage(`{"a":[1,2],"b":"x"}`),
		json.RawMessage(`{"b":"x","a":[1,2]}`),
		Checker{Kind: "exact"},
	)
	if err != nil || !passed {
		t.Fatalf("expected exact match, got passed=%v err=%v", passed, err)
	}
}

func TestUnorderedChecker(t *testing.T) {
	passed, err := compareValues(
		json.RawMessage(`[1,2,3]`),
		json.RawMessage(`[3,1,2]`),
		Checker{Kind: "unordered"},
	)
	if err != nil || !passed {
		t.Fatalf("expected unordered match, got passed=%v err=%v", passed, err)
	}

	passed, err = compareValues(
		json.RawMessage(`[1,2,3]`),
		json.RawMessage(`[1,2,2]`),
		Checker{Kind: "unordered"},
	)
	if err != nil || passed {
		t.Fatalf("expected unordered mismatch, got passed=%v err=%v", passed, err)
	}
}

func TestFloatChecker(t *testing.T) {
	passed, err := compareValues(
		json.RawMessage(`[0.1,0.2,1.0]`),
		json.RawMessage(`[0.1,0.2,1.000001]`),
		Checker{Kind: "float"},
	)
	if err != nil || !passed {
		t.Fatalf("expected float match, got passed=%v err=%v", passed, err)
	}

	passed, err = compareValues(
		json.RawMessage(`[1.0]`),
		json.RawMessage(`[1.1]`),
		Checker{Kind: "float"},
	)
	if err != nil || passed {
		t.Fatalf("expected float mismatch, got passed=%v err=%v", passed, err)
	}
}

func TestSetOfSetsChecker(t *testing.T) {
	passed, err := compareValues(
		json.RawMessage(`[[1,2],[3]]`),
		json.RawMessage(`[[2,1],[3]]`),
		Checker{Kind: "set-of-sets"},
	)
	if err != nil || !passed {
		t.Fatalf("expected set-of-sets match, got passed=%v err=%v", passed, err)
	}

	passed, err = compareValues(
		json.RawMessage(`[[1,2],[3]]`),
		json.RawMessage(`[[1],[2,3]]`),
		Checker{Kind: "set-of-sets"},
	)
	if err != nil || passed {
		t.Fatalf("expected set-of-sets mismatch, got passed=%v err=%v", passed, err)
	}
}

func TestUnsupportedChecker(t *testing.T) {
	_, err := compareValues(
		json.RawMessage(`1`),
		json.RawMessage(`1`),
		Checker{Kind: "custom"},
	)
	if err == nil {
		t.Fatal("expected unsupported checker error")
	}
}
