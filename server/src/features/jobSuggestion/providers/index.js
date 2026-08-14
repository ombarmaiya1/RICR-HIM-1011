import {
  searchGreenhouseJobs,
} from "./greenhouse.provider.js";

import {
  searchLeverJobs,
} from "./lever.provider.js";

export const searchAllJobProviders = async ({
  query,
}) => {
  const providers = [
    {
      name: "greenhouse",
      search: searchGreenhouseJobs,
    },
    {
      name: "lever",
      search: searchLeverJobs,
    },
  ];

  const results = await Promise.allSettled(
    providers.map((provider) =>
      provider.search({ query })
    )
  );

  const jobs = [];

  results.forEach((result, index) => {
    const provider = providers[index];

    if (result.status === "fulfilled") {
      jobs.push(...result.value);
    } else {
      console.error(
        `${provider.name} provider failed:`,
        result.reason?.message
      );
    }
  });

  return jobs;
};