import { AnalyticsRangeDto } from '@/modules/analytics/dto/analytics-range.dto';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

export type AnalyticsDateRange = {
  from: Date;
  to: Date;
};

const DEFAULT_RANGE_DAYS = 30;

@Injectable()
export class AnalyticsDateRangeService {
  resolveAnalyticsRange(input: AnalyticsRangeDto): AnalyticsDateRange {
    const now = dayjs();
    const to = input.to ? dayjs(input.to).endOf('day') : now;
    const from = input.from
      ? dayjs(input.from).startOf('day')
      : to.subtract(DEFAULT_RANGE_DAYS - 1, 'day').startOf('day');

    return {
      from: from.toDate(),
      to: to.toDate(),
    };
  }

  resolvePreviousRange(range: AnalyticsDateRange): AnalyticsDateRange {
    const from = dayjs(range.from);
    const to = dayjs(range.to);
    const spanMs = to.diff(from);
    const previousTo = from.subtract(1, 'millisecond');
    const previousFrom = previousTo.subtract(spanMs, 'millisecond');

    return {
      from: previousFrom.toDate(),
      to: previousTo.toDate(),
    };
  }
}
