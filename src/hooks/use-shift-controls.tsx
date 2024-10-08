import { Shift } from "@prisma/client";
import { DateTime, Duration } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { db } from "~/lib/db";

export function useShiftControls({
  shiftData,
}: {
  shiftData?: Omit<Shift, "userId">;
}) {
  const [data, setData] = useState<Omit<Shift, "userId">>();

  useEffect(() => {
    if (shiftData) {
      setData(shiftData);

      return () => undefined;
    }

    const timer = setInterval(() => {
      db.shifts
        .filter((shift) => !shift.endedAt)
        .limit(1)
        .toArray()
        .then((data) => setData(data[0]));
    }, 1000);
    return () => clearInterval(timer);
  }, [shiftData]);

  const meta = useMemo(() => {
    if (!data) return {};
    const ongoingBreak = data.breaks.some(
      (breakPeriod) => !breakPeriod.endedAt,
    );
    // Convert dates to Luxon DateTime
    const shiftStart = DateTime.fromJSDate(data.startedAt);
    const shiftEnd = data.endedAt
      ? DateTime.fromJSDate(data.endedAt)
      : DateTime.now();

    // Calculate total working time
    const totalWorkingTime = shiftEnd.diff(
      shiftStart,
      "milliseconds",
    ).milliseconds;

    // Calculate total break time
    const totalBreakTime = data.breaks.reduce((acc, breakPeriod) => {
      const breakStart = DateTime.fromJSDate(breakPeriod.startedAt);
      const breakEnd = breakPeriod.endedAt
        ? DateTime.fromJSDate(breakPeriod.endedAt)
        : DateTime.now();
      return acc + breakEnd.diff(breakStart, "milliseconds").milliseconds;
    }, 0);

    // Calculate working time without breaks
    const workingTimeWithoutBreaks = totalWorkingTime - totalBreakTime;

    // Calculate percentage of time spent on breaks
    const breakPercentage = (totalBreakTime / totalWorkingTime) * 100;

    return {
      totalWorkingTime,
      totalBreakTime,
      workingTimeWithoutBreaks,
      breakPercentage,
      formattedTime: formatDuration(workingTimeWithoutBreaks),
      formattedBreakTime: formatDuration(totalBreakTime),
      formattedTotalTime: formatDuration(totalWorkingTime),
      ongoingBreak,
    };
  }, [data]);

  return {
    ...meta,
    data,
  };
}

export function formatDuration(milliseconds: number) {
  const duration = Duration.fromMillis(milliseconds);
  return duration.toFormat("h'h' m'm' s's'");
}
