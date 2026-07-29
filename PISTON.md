# Piston execution

RecallCode calls Piston from server route handlers. The browser never contacts
the executor directly.

## Supported languages

- JavaScript
- TypeScript
- Python
- Java
- C++

Before execution, RecallCode requests `/runtimes` and selects an installed
version matching the language or its aliases. No stale runtime version is
hard-coded.

## Request safeguards

- Authentication required
- Source limited to 50,000 characters
- Standard input limited to 10,000 characters
- 10-second compile timeout
- 5-second run timeout
- Compile and run memory limits
- 20-second upstream request timeout

## Run versus submit

Run executes code and displays output without storing data. Submit executes the
same code and stores the result. A zero compile/run exit is recorded as
`accepted` for the metadata-based workspace and triggers the learning flow.

RecallCode deliberately does not copy copyrighted statements or hidden tests.
Therefore `accepted` means the program compiled and completed on the supplied
standard input; it does not claim acceptance by the source platform.

## Self-hosting

Set `PISTON_API_URL` to the base API URL of a compatible Piston deployment. The
value should not end in `/execute`; RecallCode appends `/runtimes` and
`/execute`.
