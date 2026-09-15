// The label gate and the template render for the work-items action. It reads
// the action's inputs from the environment, decides whether the issue is work
// at all, and where it is, renders the item's instructions and writes them to
// the file named by INDIR. It prints one line to stdout: "SKIP: <reason>"
// where the issue is not work, or "GO" where it is.
"use strict";

const fs = require("fs");

const split = (s) => s.split(",").map((x) => x.trim()).filter((x) => x !== "");

const wanted = split(process.env.LABELS || "");
const carried = split(process.env.ISSUE_LABELS || "");
const number = process.env.ISSUE_NUMBER || "";

if (wanted.length > 0 && !wanted.some((w) => carried.includes(w))) {
  console.log(
    `SKIP: issue #${number} carries none of the labels this action works (` +
      `${wanted.join(", ")}): it is not work, and the work list is untouched`,
  );
  process.exit(0);
}

const fields = {
  Title: process.env.ISSUE_TITLE || "",
  Body: process.env.ISSUE_BODY || "",
  Number: number,
  URL: process.env.ISSUE_URL || "",
  Labels: (process.env.ISSUE_LABELS || "").replace(/,/g, ", "),
};

let out = process.env.TEMPLATE || "";
out = out.replace(/\{\{\s*\.(\w+)\s*\}\}/g, (match, key) =>
  key in fields ? fields[key] : match,
);

fs.writeFileSync(process.env.INDIR, out);
console.log("GO");
