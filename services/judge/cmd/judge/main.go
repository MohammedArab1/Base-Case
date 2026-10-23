package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"runtime"

	"github.com/base-case/base-case/services/judge/internal/judge"
	"github.com/base-case/base-case/services/judge/internal/protocol"
	"github.com/base-case/base-case/services/judge/internal/server"
)

const version = "0.1.0"

func main() {
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "doctor":
			printDoctor()
			return
		case "version", "--version", "-v":
			fmt.Println(version)
			return
		case "serve":
			// Fall through to the JSONL loop.
		case "help", "--help", "-h":
			printUsage()
			return
		default:
			fmt.Fprintf(os.Stderr, "unknown command %q\n\n", os.Args[1])
			printUsage()
			os.Exit(2)
		}
	}

	judge := server.New(server.Info{
		Name:            "base-case-judge",
		Version:         version,
		ProtocolVersion: protocol.Version,
	})

	if err := judge.Serve(os.Stdin, os.Stdout); err != nil {
		fmt.Fprintf(os.Stderr, "judge: %v\n", err)
		os.Exit(1)
	}
}

func printDoctor() {
	runner := judge.NewRunner()

	report := map[string]any{
		"status":          "ok",
		"name":            "base-case-judge",
		"version":         version,
		"protocolVersion": protocol.Version,
		"os":              runtime.GOOS,
		"arch":            runtime.GOARCH,
		"goVersion":       runtime.Version(),
		"runtimes":        runner.Doctor(context.Background()),
	}

	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(report); err != nil {
		fmt.Fprintf(os.Stderr, "judge doctor: %v\n", err)
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Printf(`base-case-judge %s

Usage:
  judge serve       Run the JSONL sidecar on stdin/stdout (default).
  judge doctor      Print environment diagnostics as JSON.
  judge version     Print the judge version.
  judge help        Print this help.

Protocol:
  One JSON request per line, one JSON response per line.
  Protocol version: %d
`, version, protocol.Version)
}
