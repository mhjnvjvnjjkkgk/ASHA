---
name: empirical-validation
description: Requires proof before marking work complete — no "trust me, it works"
---

# Empirical Validation

## Core Principle

> **"The code looks correct" is NOT validation.**
> 
> Every change must be verified with empirical evidence before being marked complete.

## Validation Methods by Change Type

| Change Type | Required Validation | Tool |
|-------------|---------------------|------|
| **UI Changes** | Screenshot showing expected visual state | `browser_subagent` |
| **API Endpoints** | Command showing correct response | `run_command` |
| **Build/Config** | Successful build or test output | `run_command` |
| **Data Changes** | Query showing expected data state | `run_command` |
| **File Operations** | File listing or content verification | `run_command` |

## Validation Protocol

### Before Marking Any Task "Done"

1. **Identify Verification Criteria**
   - What should be true after this change?
   - How can that be observed?

2. **Execute Verification**
   - Run the appropriate command or action
   - Capture the output/evidence

3. **Document Evidence**
   - Add to `.gsd/JOURNAL.md` under the task
   - Include actual output, not just "passed"

4. **Confirm Against Criteria**
   - Does evidence match expected outcome?
   - If not, task is NOT complete
