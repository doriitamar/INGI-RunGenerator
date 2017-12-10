# INGInious/RunGenerator

This module is a [run file](https://inginious.readthedocs.io/en/v0.4/teacher_doc/run_file.html) generator for [INGInious](https://github.com/UCL-INGI/INGInious).
The original purpose was to enable anonymous code execution with integrating LMS, the execution is meant to be **agnostic** of the expected result, and thus, the generated script is returning a JSON contaning only dry details about the execution itself.

This module is stiil in it's infancy so feel free to open issues with feature requests!

# Install

```bash
$ npm install run-gen
```

After installing with `npm` you can require this library from JavaScript or TypeScript:

JavaScript
```js
const RunGen = require('run-gen');
```

TypeScript:
```typescript
import RunGen from "run-gen";
```

# Usage

## Library

```js
run-gen.generateRun(language: ("cpp"|"java"|"python"), cases: [{input: [String], inputFiles:[File] ,outputFiles:[File]}...], problemId: String): string
```
Generates a run file for a task that has one sub-problem and runs all of the `cases`.
The script itself returns a JSON - an array of case results.


Example

```js
> RunGen.generateRun("cpp", [{"input": ["a"],"inputFiles": [{"name": "ingi", "content": "is good"}], "outputFiles": []}], "thecode");
```
#### Output
```bash
\#!/bin/bash


# Parsing input for thecode
getinput "thecode" > student_code.cpp


# Compiling using cpp compiler
g++ -o student_code.out student_code.cpp &> compiler


touch input
feedback-msg -aem "["


# Case #0:
echo "a" > input

./student_code.out < input > output 2>error

output=$(<output)

compiler=$(<compiler)


#Escape characters

echo $output | sed -e "s/[\]/\\\\\\\/g" > output

output=$(<output)

errors=$(<error)

feedback-msg -aem "{\"status\": \"ok\",\"compiler\":\"$compiler\",\"error\": \"$errors\", \"output\": \"$output\", \"files\":[]}"

feedback-msg -aem "]"


# Failing every automatic-generated test, since CodeIT handles validations

feedback-result failed
```

---


# License

MIT

```
Copyright (c) 2013–2016 Brian J. Brennan

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
