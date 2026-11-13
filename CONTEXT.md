# SauceDemo QA

Quality assessment of the SauceDemo ("Swag Labs") public demo shop: automated checks, defects found, and shopper-experience recommendations.

## Language

**Persona**:
One of the demo login accounts listed on the SauceDemo login page, each representing a distinct shop behavior (e.g. `standard_user`, `problem_user`).
_Avoid_: test user, account, login

**Baseline Persona**:
`standard_user`; the reference whose behavior defines "correct" when no other source does.
_Avoid_: happy user, normal user

**Bug**:
Behavior that deviates from the Baseline Persona or contradicts the shop's own stated behavior (wrong image, broken sort, input that won't accept text).
_Avoid_: defect, issue, glitch

**UX Issue**:
Behavior that works as built but confuses, frustrates, or blocks a real Shopper.
_Avoid_: bug, usability bug, design flaw

**Known Bug**:
A Bug that is catalogued with an ID and pinned by a check expected to fail until the Bug is fixed.
_Avoid_: expected failure, xfail

**Shopper**:
A real person buying from the shop, as opposed to a Persona used for testing.
_Avoid_: user, customer

**Finding**:
A candidate Bug or UX Issue reported by the exploratory agent, unconfirmed until a human reviews it.
_Avoid_: result, detection

**Verdict**:
A judge's classification of a Finding as Bug, UX Issue, or rejected, with evidence; final only after human acceptance or overrule.
_Avoid_: score, rating, label

**Overrule**:
A human reversal of a Verdict; the record of where AI got it wrong.
_Avoid_: correction, override

**Severity**:
How badly a Bug harms the Shopper or the shop, independent of when it gets fixed.
_Avoid_: impact, criticality

**Priority**:
How soon a Bug should be fixed, weighing Severity against visibility and business cost.
_Avoid_: urgency, importance

**Test Case**:
A numbered, human-readable check (TC-NN) with preconditions, steps, and expected result, traceable to the automated check that covers it.
_Avoid_: scenario, test, spec
