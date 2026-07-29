import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const groups = [
  {
    pattern: "Array",
    topic: "Arrays & Hashing",
    rows: [
      ["Contains Duplicate", "contains-duplicate", "Easy", 15, ["array", "hash-table"]],
      ["Valid Anagram", "valid-anagram", "Easy", 15, ["string", "hash-table", "sorting"]],
      ["Two Sum", "two-sum", "Easy", 20, ["array", "hash-table"]],
      ["Group Anagrams", "group-anagrams", "Medium", 25, ["array", "string", "hash-table"]],
      ["Top K Frequent Elements", "top-k-frequent-elements", "Medium", 30, ["array", "hash-table", "heap"]],
      ["Product of Array Except Self", "product-of-array-except-self", "Medium", 25, ["array", "prefix-sum"]],
      ["Valid Sudoku", "valid-sudoku", "Medium", 30, ["array", "hash-table", "matrix"]],
      ["Encode and Decode Strings", "encode-and-decode-strings", "Medium", 30, ["array", "string", "design"]],
      ["Longest Consecutive Sequence", "longest-consecutive-sequence", "Medium", 30, ["array", "hash-table"]],
    ],
  },
  {
    pattern: "Two Pointers",
    topic: "Two Pointers",
    rows: [
      ["Valid Palindrome", "valid-palindrome", "Easy", 15, ["string", "two-pointers"]],
      ["Two Sum II — Input Array Is Sorted", "two-sum-ii-input-array-is-sorted", "Medium", 20, ["array", "two-pointers", "binary-search"]],
      ["3Sum", "3sum", "Medium", 30, ["array", "two-pointers", "sorting"]],
      ["Container With Most Water", "container-with-most-water", "Medium", 25, ["array", "two-pointers", "greedy"]],
      ["Trapping Rain Water", "trapping-rain-water", "Hard", 40, ["array", "two-pointers", "stack"]],
    ],
  },
  {
    pattern: "Sliding Window",
    topic: "Sliding Window",
    rows: [
      ["Best Time to Buy and Sell Stock", "best-time-to-buy-and-sell-stock", "Easy", 20, ["array", "dynamic-programming"]],
      ["Longest Substring Without Repeating Characters", "longest-substring-without-repeating-characters", "Medium", 25, ["string", "hash-table", "sliding-window"]],
      ["Longest Repeating Character Replacement", "longest-repeating-character-replacement", "Medium", 30, ["string", "hash-table", "sliding-window"]],
      ["Permutation in String", "permutation-in-string", "Medium", 30, ["string", "hash-table", "sliding-window"]],
      ["Minimum Window Substring", "minimum-window-substring", "Hard", 40, ["string", "hash-table", "sliding-window"]],
      ["Sliding Window Maximum", "sliding-window-maximum", "Hard", 40, ["array", "queue", "sliding-window", "monotonic-queue"]],
    ],
  },
  {
    pattern: "Stack",
    topic: "Stack",
    rows: [
      ["Valid Parentheses", "valid-parentheses", "Easy", 15, ["string", "stack"]],
      ["Min Stack", "min-stack", "Medium", 25, ["stack", "design"]],
      ["Evaluate Reverse Polish Notation", "evaluate-reverse-polish-notation", "Medium", 25, ["array", "math", "stack"]],
      ["Generate Parentheses", "generate-parentheses", "Medium", 25, ["string", "backtracking"]],
      ["Daily Temperatures", "daily-temperatures", "Medium", 30, ["array", "stack", "monotonic-stack"]],
      ["Car Fleet", "car-fleet", "Medium", 30, ["array", "stack", "sorting"]],
      ["Largest Rectangle in Histogram", "largest-rectangle-in-histogram", "Hard", 45, ["array", "stack", "monotonic-stack"]],
    ],
  },
  {
    pattern: "Binary Search",
    topic: "Binary Search",
    rows: [
      ["Binary Search", "binary-search", "Easy", 15, ["array", "binary-search"]],
      ["Search a 2D Matrix", "search-a-2d-matrix", "Medium", 25, ["array", "binary-search", "matrix"]],
      ["Koko Eating Bananas", "koko-eating-bananas", "Medium", 30, ["array", "binary-search"]],
      ["Find Minimum in Rotated Sorted Array", "find-minimum-in-rotated-sorted-array", "Medium", 25, ["array", "binary-search"]],
      ["Search in Rotated Sorted Array", "search-in-rotated-sorted-array", "Medium", 30, ["array", "binary-search"]],
      ["Time Based Key-Value Store", "time-based-key-value-store", "Medium", 35, ["string", "hash-table", "binary-search", "design"]],
      ["Median of Two Sorted Arrays", "median-of-two-sorted-arrays", "Hard", 50, ["array", "binary-search", "divide-and-conquer"]],
    ],
  },
  {
    pattern: "Linked List",
    topic: "Linked List",
    rows: [
      ["Reverse Linked List", "reverse-linked-list", "Easy", 20, ["linked-list", "recursion"]],
      ["Merge Two Sorted Lists", "merge-two-sorted-lists", "Easy", 20, ["linked-list", "recursion"]],
      ["Reorder List", "reorder-list", "Medium", 30, ["linked-list", "two-pointers", "stack"]],
      ["Remove Nth Node From End of List", "remove-nth-node-from-end-of-list", "Medium", 25, ["linked-list", "two-pointers"]],
      ["Copy List With Random Pointer", "copy-list-with-random-pointer", "Medium", 35, ["linked-list", "hash-table"]],
      ["Add Two Numbers", "add-two-numbers", "Medium", 30, ["linked-list", "math", "recursion"]],
      ["Linked List Cycle", "linked-list-cycle", "Easy", 20, ["linked-list", "two-pointers"]],
      ["Find the Duplicate Number", "find-the-duplicate-number", "Medium", 30, ["array", "two-pointers", "binary-search"]],
      ["LRU Cache", "lru-cache", "Medium", 45, ["hash-table", "linked-list", "design"]],
      ["Merge K Sorted Lists", "merge-k-sorted-lists", "Hard", 45, ["linked-list", "divide-and-conquer", "heap"]],
      ["Reverse Nodes in K-Group", "reverse-nodes-in-k-group", "Hard", 50, ["linked-list", "recursion"]],
    ],
  },
  {
    pattern: "Tree",
    topic: "Trees",
    rows: [
      ["Invert Binary Tree", "invert-binary-tree", "Easy", 20, ["tree", "depth-first-search", "breadth-first-search"]],
      ["Maximum Depth of Binary Tree", "maximum-depth-of-binary-tree", "Easy", 20, ["tree", "depth-first-search", "breadth-first-search"]],
      ["Diameter of Binary Tree", "diameter-of-binary-tree", "Easy", 25, ["tree", "depth-first-search"]],
      ["Balanced Binary Tree", "balanced-binary-tree", "Easy", 25, ["tree", "depth-first-search"]],
      ["Same Tree", "same-tree", "Easy", 15, ["tree", "depth-first-search", "breadth-first-search"]],
      ["Subtree of Another Tree", "subtree-of-another-tree", "Easy", 25, ["tree", "depth-first-search", "string-matching"]],
      ["Lowest Common Ancestor of a Binary Search Tree", "lowest-common-ancestor-of-a-binary-search-tree", "Medium", 25, ["tree", "binary-search-tree"]],
      ["Binary Tree Level Order Traversal", "binary-tree-level-order-traversal", "Medium", 25, ["tree", "breadth-first-search"]],
      ["Binary Tree Right Side View", "binary-tree-right-side-view", "Medium", 25, ["tree", "breadth-first-search", "depth-first-search"]],
      ["Count Good Nodes in Binary Tree", "count-good-nodes-in-binary-tree", "Medium", 25, ["tree", "depth-first-search"]],
      ["Validate Binary Search Tree", "validate-binary-search-tree", "Medium", 30, ["tree", "depth-first-search", "binary-search-tree"]],
      ["Kth Smallest Element in a BST", "kth-smallest-element-in-a-bst", "Medium", 30, ["tree", "depth-first-search", "binary-search-tree"]],
      ["Construct Binary Tree From Preorder and Inorder Traversal", "construct-binary-tree-from-preorder-and-inorder-traversal", "Medium", 40, ["array", "tree", "hash-table", "divide-and-conquer"]],
      ["Binary Tree Maximum Path Sum", "binary-tree-maximum-path-sum", "Hard", 45, ["tree", "depth-first-search", "dynamic-programming"]],
      ["Serialize and Deserialize Binary Tree", "serialize-and-deserialize-binary-tree", "Hard", 50, ["string", "tree", "design"]],
    ],
  },
  {
    pattern: "Trie",
    topic: "Tries",
    rows: [
      ["Implement Trie (Prefix Tree)", "implement-trie-prefix-tree", "Medium", 30, ["hash-table", "string", "trie", "design"]],
      ["Design Add and Search Words Data Structure", "design-add-and-search-words-data-structure", "Medium", 35, ["string", "depth-first-search", "trie", "design"]],
      ["Word Search II", "word-search-ii", "Hard", 50, ["array", "string", "backtracking", "trie", "matrix"]],
    ],
  },
  {
    pattern: "Heap",
    topic: "Heap / Priority Queue",
    rows: [
      ["Kth Largest Element in a Stream", "kth-largest-element-in-a-stream", "Easy", 25, ["tree", "design", "heap"]],
      ["Last Stone Weight", "last-stone-weight", "Easy", 20, ["array", "heap"]],
      ["K Closest Points to Origin", "k-closest-points-to-origin", "Medium", 30, ["array", "math", "geometry", "heap", "sorting"]],
      ["Kth Largest Element in an Array", "kth-largest-element-in-an-array", "Medium", 30, ["array", "divide-and-conquer", "heap", "sorting"]],
      ["Task Scheduler", "task-scheduler", "Medium", 35, ["array", "hash-table", "greedy", "heap"]],
      ["Design Twitter", "design-twitter", "Medium", 45, ["hash-table", "linked-list", "design", "heap"]],
      ["Find Median From Data Stream", "find-median-from-data-stream", "Hard", 45, ["two-pointers", "design", "sorting", "heap"]],
    ],
  },
  {
    pattern: "Backtracking",
    topic: "Backtracking",
    rows: [
      ["Subsets", "subsets", "Medium", 25, ["array", "backtracking", "bit-manipulation"]],
      ["Combination Sum", "combination-sum", "Medium", 30, ["array", "backtracking"]],
      ["Permutations", "permutations", "Medium", 25, ["array", "backtracking"]],
      ["Subsets II", "subsets-ii", "Medium", 30, ["array", "backtracking", "bit-manipulation"]],
      ["Combination Sum II", "combination-sum-ii", "Medium", 35, ["array", "backtracking"]],
      ["Word Search", "word-search", "Medium", 35, ["array", "string", "backtracking", "matrix"]],
      ["Palindrome Partitioning", "palindrome-partitioning", "Medium", 35, ["string", "dynamic-programming", "backtracking"]],
      ["Letter Combinations of a Phone Number", "letter-combinations-of-a-phone-number", "Medium", 25, ["hash-table", "string", "backtracking"]],
      ["N-Queens", "n-queens", "Hard", 45, ["array", "backtracking"]],
    ],
  },
  {
    pattern: "Graph",
    topic: "Graphs",
    rows: [
      ["Number of Islands", "number-of-islands", "Medium", 30, ["array", "depth-first-search", "breadth-first-search", "union-find", "matrix"]],
      ["Clone Graph", "clone-graph", "Medium", 30, ["hash-table", "depth-first-search", "breadth-first-search", "graph"]],
      ["Max Area of Island", "max-area-of-island", "Medium", 25, ["array", "depth-first-search", "breadth-first-search", "union-find", "matrix"]],
      ["Pacific Atlantic Water Flow", "pacific-atlantic-water-flow", "Medium", 35, ["array", "depth-first-search", "breadth-first-search", "matrix"]],
      ["Surrounded Regions", "surrounded-regions", "Medium", 35, ["array", "depth-first-search", "breadth-first-search", "union-find", "matrix"]],
      ["Rotting Oranges", "rotting-oranges", "Medium", 30, ["array", "breadth-first-search", "matrix"]],
      ["Walls and Gates", "walls-and-gates", "Medium", 30, ["array", "breadth-first-search", "matrix"]],
      ["Course Schedule", "course-schedule", "Medium", 30, ["depth-first-search", "breadth-first-search", "graph", "topological-sort"]],
      ["Course Schedule II", "course-schedule-ii", "Medium", 35, ["depth-first-search", "breadth-first-search", "graph", "topological-sort"]],
      ["Redundant Connection", "redundant-connection", "Medium", 30, ["depth-first-search", "breadth-first-search", "union-find", "graph"]],
      ["Number of Connected Components in an Undirected Graph", "number-of-connected-components-in-an-undirected-graph", "Medium", 30, ["depth-first-search", "breadth-first-search", "union-find", "graph"]],
      ["Graph Valid Tree", "graph-valid-tree", "Medium", 30, ["depth-first-search", "breadth-first-search", "union-find", "graph"]],
      ["Word Ladder", "word-ladder", "Hard", 45, ["hash-table", "string", "breadth-first-search"]],
    ],
  },
  {
    pattern: "Graph",
    topic: "Advanced Graphs",
    rows: [
      ["Reconstruct Itinerary", "reconstruct-itinerary", "Hard", 45, ["depth-first-search", "graph", "eulerian-circuit"]],
      ["Min Cost to Connect All Points", "min-cost-to-connect-all-points", "Medium", 40, ["array", "union-find", "graph", "minimum-spanning-tree"]],
      ["Network Delay Time", "network-delay-time", "Medium", 40, ["depth-first-search", "breadth-first-search", "graph", "shortest-path"]],
      ["Swim in Rising Water", "swim-in-rising-water", "Hard", 45, ["array", "binary-search", "depth-first-search", "heap", "matrix"]],
      ["Alien Dictionary", "alien-dictionary", "Hard", 45, ["array", "string", "depth-first-search", "breadth-first-search", "topological-sort"]],
      ["Cheapest Flights Within K Stops", "cheapest-flights-within-k-stops", "Medium", 40, ["dynamic-programming", "depth-first-search", "breadth-first-search", "graph", "shortest-path"]],
    ],
  },
  {
    pattern: "Dynamic Programming",
    topic: "1-D Dynamic Programming",
    rows: [
      ["Climbing Stairs", "climbing-stairs", "Easy", 20, ["math", "dynamic-programming", "memoization"]],
      ["Min Cost Climbing Stairs", "min-cost-climbing-stairs", "Easy", 20, ["array", "dynamic-programming"]],
      ["House Robber", "house-robber", "Medium", 25, ["array", "dynamic-programming"]],
      ["House Robber II", "house-robber-ii", "Medium", 30, ["array", "dynamic-programming"]],
      ["Longest Palindromic Substring", "longest-palindromic-substring", "Medium", 35, ["string", "dynamic-programming"]],
      ["Palindromic Substrings", "palindromic-substrings", "Medium", 30, ["string", "dynamic-programming", "two-pointers"]],
      ["Decode Ways", "decode-ways", "Medium", 30, ["string", "dynamic-programming"]],
      ["Coin Change", "coin-change", "Medium", 35, ["array", "dynamic-programming", "breadth-first-search"]],
      ["Maximum Product Subarray", "maximum-product-subarray", "Medium", 30, ["array", "dynamic-programming"]],
      ["Word Break", "word-break", "Medium", 35, ["array", "hash-table", "string", "dynamic-programming"]],
      ["Longest Increasing Subsequence", "longest-increasing-subsequence", "Medium", 35, ["array", "binary-search", "dynamic-programming"]],
      ["Partition Equal Subset Sum", "partition-equal-subset-sum", "Medium", 35, ["array", "dynamic-programming"]],
    ],
  },
  {
    pattern: "Dynamic Programming",
    topic: "2-D Dynamic Programming",
    rows: [
      ["Unique Paths", "unique-paths", "Medium", 25, ["math", "dynamic-programming", "combinatorics"]],
      ["Longest Common Subsequence", "longest-common-subsequence", "Medium", 35, ["string", "dynamic-programming"]],
      ["Best Time to Buy and Sell Stock With Cooldown", "best-time-to-buy-and-sell-stock-with-cooldown", "Medium", 35, ["array", "dynamic-programming"]],
      ["Coin Change II", "coin-change-ii", "Medium", 35, ["array", "dynamic-programming"]],
      ["Target Sum", "target-sum", "Medium", 35, ["array", "dynamic-programming", "backtracking"]],
      ["Interleaving String", "interleaving-string", "Medium", 40, ["string", "dynamic-programming"]],
      ["Longest Increasing Path in a Matrix", "longest-increasing-path-in-a-matrix", "Hard", 45, ["array", "dynamic-programming", "depth-first-search", "matrix"]],
      ["Distinct Subsequences", "distinct-subsequences", "Hard", 45, ["string", "dynamic-programming"]],
      ["Edit Distance", "edit-distance", "Medium", 40, ["string", "dynamic-programming"]],
      ["Burst Balloons", "burst-balloons", "Hard", 50, ["array", "dynamic-programming"]],
      ["Regular Expression Matching", "regular-expression-matching", "Hard", 50, ["string", "dynamic-programming", "recursion"]],
    ],
  },
  {
    pattern: "Greedy",
    topic: "Greedy",
    rows: [
      ["Maximum Subarray", "maximum-subarray", "Medium", 25, ["array", "divide-and-conquer", "dynamic-programming"]],
      ["Jump Game", "jump-game", "Medium", 25, ["array", "dynamic-programming", "greedy"]],
      ["Jump Game II", "jump-game-ii", "Medium", 30, ["array", "dynamic-programming", "greedy"]],
      ["Gas Station", "gas-station", "Medium", 30, ["array", "greedy"]],
      ["Hand of Straights", "hand-of-straights", "Medium", 35, ["array", "hash-table", "greedy", "sorting"]],
      ["Merge Triplets to Form Target Triplet", "merge-triplets-to-form-target-triplet", "Medium", 25, ["array", "greedy"]],
      ["Partition Labels", "partition-labels", "Medium", 30, ["hash-table", "two-pointers", "string", "greedy"]],
      ["Valid Parenthesis String", "valid-parenthesis-string", "Medium", 30, ["string", "dynamic-programming", "stack", "greedy"]],
    ],
  },
  {
    pattern: "Intervals",
    topic: "Intervals",
    rows: [
      ["Insert Interval", "insert-interval", "Medium", 30, ["array"]],
      ["Merge Intervals", "merge-intervals", "Medium", 30, ["array", "sorting"]],
      ["Non-overlapping Intervals", "non-overlapping-intervals", "Medium", 30, ["array", "dynamic-programming", "greedy", "sorting"]],
      ["Meeting Rooms", "meeting-rooms", "Easy", 20, ["array", "sorting"]],
      ["Meeting Rooms II", "meeting-rooms-ii", "Medium", 30, ["array", "two-pointers", "greedy", "sorting", "heap"]],
      ["Minimum Interval to Include Each Query", "minimum-interval-to-include-each-query", "Hard", 45, ["array", "binary-search", "sorting", "heap"]],
    ],
  },
  {
    pattern: "Math & Geometry",
    topic: "Math & Geometry",
    rows: [
      ["Rotate Image", "rotate-image", "Medium", 30, ["array", "math", "matrix"]],
      ["Spiral Matrix", "spiral-matrix", "Medium", 30, ["array", "matrix", "simulation"]],
      ["Set Matrix Zeroes", "set-matrix-zeroes", "Medium", 30, ["array", "hash-table", "matrix"]],
      ["Happy Number", "happy-number", "Easy", 20, ["hash-table", "math", "two-pointers"]],
      ["Plus One", "plus-one", "Easy", 15, ["array", "math"]],
      ["Pow(x, n)", "powx-n", "Medium", 30, ["math", "recursion"]],
      ["Multiply Strings", "multiply-strings", "Medium", 35, ["math", "string", "simulation"]],
      ["Detect Squares", "detect-squares", "Medium", 35, ["array", "hash-table", "design", "counting"]],
    ],
  },
  {
    pattern: "Bit Manipulation",
    topic: "Bit Manipulation",
    rows: [
      ["Single Number", "single-number", "Easy", 15, ["array", "bit-manipulation"]],
      ["Number of 1 Bits", "number-of-1-bits", "Easy", 15, ["divide-and-conquer", "bit-manipulation"]],
      ["Counting Bits", "counting-bits", "Easy", 20, ["dynamic-programming", "bit-manipulation"]],
      ["Reverse Bits", "reverse-bits", "Easy", 20, ["divide-and-conquer", "bit-manipulation"]],
      ["Missing Number", "missing-number", "Easy", 20, ["array", "hash-table", "math", "bit-manipulation"]],
      ["Sum of Two Integers", "sum-of-two-integers", "Medium", 25, ["math", "bit-manipulation"]],
      ["Reverse Integer", "reverse-integer", "Medium", 25, ["math"]],
    ],
  },
];

const questions = groups.flatMap(({ pattern, topic, rows }) =>
  rows.map(([title, slug, difficulty, estimatedTime, tags]) => ({
    title,
    slug,
    difficulty,
    pattern,
    topic,
    estimatedTime,
    tags,
  })),
);

if (questions.length !== 150) {
  throw new Error(`Expected 150 questions, found ${questions.length}.`);
}

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const array = (values) => `array[${values.map(quote).join(", ")}]::text[]`;

const values = questions
  .map(
    (question) =>
      `  (${quote(question.title)}, ${quote(question.slug)}, ${quote(
        question.difficulty,
      )}::public.question_difficulty, (select id from public.patterns where name = ${quote(
        question.pattern,
      )}), ${quote(question.topic)}, '{}'::text[], ${array(
        question.tags,
      )}, ${quote(
        `https://leetcode.com/problems/${question.slug}/`,
      )}, '{}'::text[], ${question.estimatedTime})`,
  )
  .join(",\n");

const slugs = questions.map((question) => quote(question.slug)).join(",\n    ");

const output = `-- NeetCode 150 metadata seed for RecallCode.
-- Contains titles and metadata only. No copyrighted problem statements.
-- Generated by scripts/generate-neetcode-seed.mjs.

insert into public.questions (
  title,
  slug,
  difficulty,
  pattern_id,
  topic,
  companies,
  tags,
  leetcode_url,
  hints,
  estimated_time
)
values
${values}
on conflict (slug)
do update set
  title = excluded.title,
  difficulty = excluded.difficulty,
  pattern_id = excluded.pattern_id,
  topic = excluded.topic,
  companies = excluded.companies,
  tags = excluded.tags,
  leetcode_url = excluded.leetcode_url,
  estimated_time = excluded.estimated_time,
  updated_at = now();

insert into public.question_tags (question_id, tag)
select q.id, tag
from public.questions q
cross join lateral unnest(q.tags) as tag
where q.slug in (
    ${slugs}
)
on conflict (question_id, tag) do nothing;
`;

const target = resolve("database", "seed_neetcode150.sql");
writeFileSync(target, output, "utf8");
console.log(`Wrote ${questions.length} questions to ${target}`);
