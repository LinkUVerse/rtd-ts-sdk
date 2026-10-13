---
'rtd-typescript': patch
---

Remove the Intl.PluralRules dependency from transaction command ordinal formatting so native runtimes can load simulation and receipt parsing without that optional runtime API.
