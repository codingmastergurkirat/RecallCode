import { Search } from "lucide-react";
import Link from "next/link";
import type { Pattern } from "@/types/database";

const topics = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Heap / Priority Queue",
  "Backtracking",
  "Graphs",
  "Advanced Graphs",
  "1-D Dynamic Programming",
  "2-D Dynamic Programming",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
];

export function QuestionFilters({
  patterns,
  values,
}: {
  patterns: Pattern[];
  values: {
    search?: string;
    pattern?: string;
    difficulty?: string;
    topic?: string;
  };
}) {
  const active = Boolean(
    values.search || values.pattern || values.difficulty || values.topic,
  );

  return (
    <form className="problem-filters" method="get">
      <label className="filter-search">
        <Search size={18} />
        <span className="sr-only">Search problems</span>
        <input
          type="search"
          name="search"
          defaultValue={values.search}
          placeholder="Search problems or topics"
        />
      </label>
      <label>
        <span className="sr-only">Pattern</span>
        <select name="pattern" defaultValue={values.pattern ?? ""}>
          <option value="">All patterns</option>
          {patterns.map((pattern) => (
            <option value={pattern.slug} key={pattern.slug}>
              {pattern.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Difficulty</span>
        <select name="difficulty" defaultValue={values.difficulty ?? ""}>
          <option value="">All difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </label>
      <label>
        <span className="sr-only">Topic</span>
        <select name="topic" defaultValue={values.topic ?? ""}>
          <option value="">All topics</option>
          {topics.map((topic) => (
            <option value={topic} key={topic}>
              {topic}
            </option>
          ))}
        </select>
      </label>
      <button className="button button-primary button-md" type="submit">
        Apply
      </button>
      {active ? (
        <Link className="filter-clear" href="/problems">
          Clear
        </Link>
      ) : null}
    </form>
  );
}
