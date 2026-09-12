"use client";

import { useEffect, useState } from "react";
import type { ActivationCodePrintJob } from "@repo/shared";
import type { ActivationCodeBatchListItem } from "@/src/services/activation-codes/activation-code-batches.types";

const STORAGE_KEY = "admin.activation-code-print-jobs";

export type TrackedActivationCodePrintJob = {
  batchCode: string;
  batchName?: string;
  productName: string;
  job: ActivationCodePrintJob;
};

export function useActivationCodePrintJobs() {
  const [jobs, setJobs] = useState<TrackedActivationCodePrintJob[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored)
        setJobs(JSON.parse(stored) as TrackedActivationCodePrintJob[]);
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(jobs.slice(0, 20)),
    );
  }, [hydrated, jobs]);

  return {
    add(batch: ActivationCodeBatchListItem, job: ActivationCodePrintJob) {
      setJobs((current) => [
        {
          batchCode: batch.batchCode,
          batchName: batch.batchName,
          job,
          productName: batch.productName,
        },
        ...current.filter((item) => item.job.id !== job.id),
      ]);
    },
    jobs,
    remove(jobId: string) {
      setJobs((current) => current.filter((item) => item.job.id !== jobId));
    },
  };
}
