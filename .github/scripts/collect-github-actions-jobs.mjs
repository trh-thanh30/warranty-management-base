import { writeFileSync } from "node:fs";

const {
  GITHUB_API_URL = "https://api.github.com",
  GITHUB_REPOSITORY,
  GITHUB_RUN_ID,
  GITHUB_TOKEN,
  GITHUB_OUTPUT,
  JOBS_JSON_PATH,
  JOB_TOTALS_PATH,
} = process.env;

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!GITHUB_REPOSITORY) fail("GITHUB_REPOSITORY is required");
if (!GITHUB_RUN_ID) fail("GITHUB_RUN_ID is required");
if (!GITHUB_TOKEN) fail("GITHUB_TOKEN is required");

function mapStatus(status, conclusion) {
  if (conclusion === "success") return "success";
  if (
    conclusion === "failure" ||
    conclusion === "timed_out" ||
    conclusion === "action_required"
  ) {
    return "failed";
  }
  if (
    conclusion === "cancelled" ||
    conclusion === "skipped" ||
    conclusion === "neutral"
  ) {
    return "cancelled";
  }
  if (status === "completed") return "cancelled";
  return "running";
}

function formatDuration(startedAt, completedAt) {
  if (!startedAt) return undefined;

  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start)
    return undefined;

  const seconds = Math.max(0, Math.round((end - start) / 1000));
  if (seconds < 60) return `${seconds}.00s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m${remainingSeconds.toString().padStart(2, "0")}s`;
}

async function fetchJobs(page = 1) {
  const url = `${GITHUB_API_URL}/repos/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}/jobs?per_page=100&page=${page}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch workflow jobs: ${response.status} ${await response.text()}`,
    );
  }

  return response.json();
}

function writeOutput(name, value) {
  if (!GITHUB_OUTPUT) {
    console.log(`${name}=${value}`);
    return;
  }

  writeFileSync(
    GITHUB_OUTPUT,
    `${name}<<__GITHUB_OUTPUT__\n${value}\n__GITHUB_OUTPUT__\n`,
    {
      flag: "a",
    },
  );
}

function writeOptionalFile(filePath, value) {
  if (!filePath) return;
  writeFileSync(filePath, value);
}

const allJobs = [];
for (let page = 1; ; page += 1) {
  const data = await fetchJobs(page);
  allJobs.push(...(data.jobs ?? []));

  if (
    !data.jobs?.length ||
    allJobs.length >= (data.total_count ?? allJobs.length)
  )
    break;
}

const jobs = allJobs
  .sort(
    (left, right) =>
      new Date(left.started_at ?? 0).getTime() -
      new Date(right.started_at ?? 0).getTime(),
  )
  .map((job) => ({
    name: job.name,
    status: mapStatus(job.status, job.conclusion),
    duration: formatDuration(job.started_at, job.completed_at),
    url: job.html_url,
    steps: (job.steps ?? []).map((step) => ({
      name: step.name,
      status: mapStatus(step.status, step.conclusion),
      duration: formatDuration(step.started_at, step.completed_at),
    })),
  }));

const totals = jobs.reduce(
  (accumulator, job) => {
    accumulator[job.status] += 1;
    return accumulator;
  },
  { success: 0, failed: 0, running: 0, cancelled: 0 },
);

writeOutput("jobs_json", JSON.stringify(jobs));
writeOutput("passed", String(totals.success));
writeOutput("failed", String(totals.failed));
writeOutput("running", String(totals.running));
writeOutput("cancelled", String(totals.cancelled));
writeOptionalFile(JOBS_JSON_PATH, JSON.stringify(jobs));
writeOptionalFile(JOB_TOTALS_PATH, JSON.stringify(totals));
