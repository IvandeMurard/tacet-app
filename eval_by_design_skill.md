---
name: eval-by-design
description: >
  Applies the "Evaluation-by-Design" methodology to a repository. This sets up a CI gate for ML/LLM systems, a polymorphic golden dataset, and observability extensions to track abstentions and drift.
---

# Evaluation-by-Design Framework Implementer

This skill guides you through implementing the Evaluation-by-Design methodology for AI/ML projects. This framework treats evaluation as a contract, not an afterthought.

## 1. The Reliability Bar (5 Dimensions)
"Working" is proven on a test set. "Reliable" is proven in production. The following five dimensions must be checked before every ship:

| Dimension | Question we answer before merge |
| --- | --- |
| **Edge behavior** | Did we test out-of-distribution inputs — or only the happy path? |
| **Graceful degradation** | Does the agent say "I don't know" explicitly when uncertain — or does it improvise? |
| **Observability** | Can we see in production what the model actually does? |
| **Reproducibility** | Same input tomorrow → same output? |
| **Distribution shift resilience** | Are we alerted if production inputs drift from training data? |

## 2. The Contract
A versioned golden dataset (`eval/golden_dataset.jsonl`) and per-layer failure thresholds (`eval/FAILURE_THRESHOLDS.md`) define what "bad output" means before code is written. 

Any change to forecast services, providers, memory, or prompts requires updated examples + a green eval pipeline before merge — CI gate, alongside the schema drift gate.

**Golden Dataset Requirements:**
- A single file `golden_dataset.jsonl` versioned in Git (easy grep/diff).
- Polymorphic schema: Different `layers` have different `input` and `expected` payload shapes.
- Taxonomic Categories: Scenarios are grouped into business-relevant categories.
- Coverage is measured by the percentage of categories that PASS.

## 3. Inspiration
Framework adopted from Qonto's "AI @ Qonto: shipper et évaluer l'IA en production" (Marianne Borzic Ducournau, Head of AI Products). Cited and extended for Aetherix's PMS+POS-aware F&B forecasting context. Detailed REX (retour d'expérience) article coming end of Phase 3.

## 4. Execution Workflow

When invoked to apply Eval-by-Design:

1. **Analyze the Repo**: Identify where prompts, models, and providers are located. Determine the "layers" (e.g., forecast, extraction, chat).
2. **Setup the Contract**: Create `eval/golden_dataset.jsonl` and `eval/FAILURE_THRESHOLDS.md`.
3. **Write the Eval Runner**: Create python scripts (e.g., `scripts/eval/run_all.py`).
4. **Setup the CI Gate**: Create `scripts/ci/check_eval_coverage.py` that maps touched files to eval subsets. It blocks PRs that degrade model performance or fail to cover new edge cases.
5. **Implement Abstention**: Introduce the `AgentAbstention` pattern in the backend code and prepare database migration SQL for the observability columns (`abstention_reason`, `abstention_context`, `drift_score`).
