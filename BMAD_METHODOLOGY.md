# BMAD Methodology Framework

**Business Model & Architecture Discovery (BMAD)** is the mandatory strategic gatekeeper for the Tacet project. Before writing any code for a new Epic, a BMAD phase must be executed to ensure the technical architecture perfectly aligns with the GTM (Go-To-Market) strategy and strict operational guardrails.

## Core Principles

1. **Human-In-The-Loop (HITL) Supremacy:**
   Tacet is a predictive engine, not an autonomous agent. Any feature that executes a physical or financial action (changing prices, emailing guests, altering IoT hardware) *must* pass through a human approval step (via Aetherix or a PMS Task). Autonomous execution is strictly forbidden.

2. **The "Killer App" Test:**
   If a feature does not directly protect yield (pricing), reduce operational friction (staffing), or enhance the luxury guest experience, it is rejected. Tacet does not build features because they are technically interesting; it builds features because they are sellable.

3. **Stateless First, Stateful Only When Necessary:**
   Tacet favors headless, stateless execution to maximize scalability. Databases and state are only introduced when advanced features (like Memory or Feedback Loops) strictly require them.

## The Discovery Process

Before initiating a new Epic, the AI Agent must:
1. Propose the technical architecture.
2. Formulate the business justification (ROI for the hotel).
3. Validate the architecture against the HITL guardrails.
4. Present the BMAD artifact to the human user for brutal, critical review.
5. Only proceed to the Implementation Plan once the BMAD is approved.
