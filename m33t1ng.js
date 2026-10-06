(function (global) {
  'use strict';

  const TIME_ZONE = 'America/New_York';
  const MEETING_HOUR = 18;
  const MEETING_MINUTE = 30;

  const zonedPartsFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });

  function getZonedParts(date) {
    return Object.fromEntries(
      zonedPartsFormatter
        .formatToParts(date)
        .filter(part => part.type !== 'literal')
        .map(part => [part.type, Number(part.value)])
    );
  }

  function zonedDateTimeToInstant(year, monthIndex, day, hour, minute) {
    const targetUtc = Date.UTC(year, monthIndex, day, hour, minute, 0);
    let candidate = new Date(targetUtc);

    for (let pass = 0; pass < 2; pass++) {
      const parts = getZonedParts(candidate);
      const representedUtc = Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second
      );
      candidate = new Date(candidate.getTime() + (targetUtc - representedUtc));
    }

    return candidate;
  }

  function normalizeYearMonth(year, monthIndex) {
    const normalized = new Date(Date.UTC(year, monthIndex, 1));
    return {
      year: normalized.getUTCFullYear(),
      monthIndex: normalized.getUTCMonth()
    };
  }

  function getMeetingDate(year, monthIndex) {
    const normalized = normalizeYearMonth(year, monthIndex);
    const lastDay = new Date(Date.UTC(normalized.year, normalized.monthIndex + 1, 0));
    const daysSinceWednesday = (lastDay.getUTCDay() - 3 + 7) % 7;
    const meetingDay = lastDay.getUTCDate() - daysSinceWednesday;

    return zonedDateTimeToInstant(
      normalized.year,
      normalized.monthIndex,
      meetingDay,
      MEETING_HOUR,
      MEETING_MINUTE
    );
  }

  function getNextMeetingDate(now = new Date()) {
    const chattanoogaNow = getZonedParts(now);
    const thisMonth = getMeetingDate(chattanoogaNow.year, chattanoogaNow.month - 1);
    return now < thisMonth
      ? thisMonth
      : getMeetingDate(chattanoogaNow.year, chattanoogaNow.month);
  }

  function formatChattanooga(date) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  }

  function formatLocal(date) {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  }

  function getCountdown(now = new Date()) {
    const meeting = getNextMeetingDate(now);
    const remainingMs = Math.max(0, meeting.getTime() - now.getTime());
    const totalMinutes = Math.floor(remainingMs / 60000);

    return {
      meeting,
      days: Math.floor(totalMinutes / 1440),
      hours: Math.floor((totalMinutes % 1440) / 60),
      minutes: totalMinutes % 60
    };
  }

  global.ChaMeeting = Object.freeze({
    TIME_ZONE,
    getMeetingDate,
    getNextMeetingDate,
    formatChattanooga,
    formatLocal,
    getCountdown
  });
})(window);