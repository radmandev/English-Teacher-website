// Run: npm test
import assert from "node:assert/strict";
import { grade, parseNumber, score, type Question } from "./grading.ts";

assert.equal(parseNumber("٣/٤"), 0.75);
assert.equal(parseNumber(" 2.5 "), 2.5);
assert.equal(parseNumber("1/0"), null);
assert.equal(parseNumber("abc"), null);

const qs: Question[] = [
  { type: "mcq", prompt: "", choices: ["a", "b"], answer: 1 },
  { type: "numeric", prompt: "", answer: 0.5 },
  { type: "fill", prompt: "", sentence: "I ___ a student.", answers: ["am"] },
  { type: "match", prompt: "", pairs: [["cat", "قطة"], ["dog", "كلب"]] },
  { type: "order", prompt: "", words: ["name", "My", "is", "Sara"], answer: "My name is Sara." },
];
assert.ok(grade(qs[0], 1) && !grade(qs[0], 0));
assert.ok(grade(qs[1], "1/2") && grade(qs[1], 0.5) && !grade(qs[1], "0.6"));
assert.ok(grade(qs[2], "  AM ") && !grade(qs[2], "is"));
assert.ok(grade(qs[3], ["قطة", "كلب"]) && !grade(qs[3], ["كلب", "قطة"]));
assert.ok(grade(qs[4], ["My", "name", "is", "Sara"]) && !grade(qs[4], ["name", "My", "is", "Sara"]));
assert.ok(!grade(qs[0], null));
assert.equal(score(qs, [1, "0.5", "am", ["قطة", "كلب"], ["My", "name", "is", "Sara"]]), 5);
assert.equal(score(qs, []), 0);
console.log("grading: all checks passed");
