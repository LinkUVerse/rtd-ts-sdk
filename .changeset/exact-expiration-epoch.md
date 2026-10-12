---
"rtd-typescript": major
---

Preserve the complete u64 range of transaction expiration epochs through BCS and transaction JSON round trips. BCS TransactionExpiration.Epoch now decodes to a decimal string instead of a potentially rounded number. Legacy v1 JSON retains numeric epochs within the safe integer range and uses decimal strings beyond it. Transaction u64 numeric inputs outside the safe integer range are rejected; callers must pass exact decimal strings.
