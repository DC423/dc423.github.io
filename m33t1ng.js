(function (global) {
  'use strict';

  const TIME_ZONE = 'America/New_York';
  const MEETING_HOUR = 18;
  const MEETING_MINUTE = 30;
  const HOLIDAYS_MEETING_LABEL = 'Holidays Meeting TBD';

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

  function isHolidaysMeetingMonth(monthIndex) {
    return monthIndex === 10 || monthIndex === 11;
  }

  function getMeetingDate(year, monthIndex) {
    const normalized = normalizeYearMonth(year, monthIndex);
    if (isHolidaysMeetingMonth(normalized.monthIndex)) return null;

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

  function getNextMeeting(now = new Date()) {
    const chattanoogaNow = getZonedParts(now);
    const monthIndex = chattanoogaNow.month - 1;

    if (isHolidaysMeetingMonth(monthIndex)) {
      return {
        type: 'holidays-tbd',
        label: HOLIDAYS_MEETING_LABEL,
        meeting: null
      };
    }

    const thisMonth = getMeetingDate(chattanoogaNow.year, monthIndex);
    if (now < thisMonth) {
      return {
        type: 'scheduled',
        label: formatChattanooga(thisMonth),
        meeting: thisMonth
      };
    }

    const nextMonth = normalizeYearMonth(chattanoogaNow.year, monthIndex + 1);
    if (isHolidaysMeetingMonth(nextMonth.monthIndex)) {
      return {
        type: 'holidays-tbd',
        label: HOLIDAYS_MEETING_LABEL,
        meeting: null
      };
    }

    const meeting = getMeetingDate(nextMonth.year, nextMonth.monthIndex);
    return {
      type: 'scheduled',
      label: formatChattanooga(meeting),
      meeting
    };
  }

  function getNextMeetingDate(now = new Date()) {
    return getNextMeeting(now).meeting;
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
    const nextMeeting = getNextMeeting(now);
    if (!nextMeeting.meeting) {
      return {
        ...nextMeeting,
        days: null,
        hours: null,
        minutes: null
      };
    }

    const meeting = nextMeeting.meeting;
    const remainingMs = Math.max(0, meeting.getTime() - now.getTime());
    const totalMinutes = Math.floor(remainingMs / 60000);

    return {
      ...nextMeeting,
      meeting,
      days: Math.floor(totalMinutes / 1440),
      hours: Math.floor((totalMinutes % 1440) / 60),
      minutes: totalMinutes % 60
    };
  }

  global.ChaMeeting = Object.freeze({
    TIME_ZONE,
    HOLIDAYS_MEETING_LABEL,
    getMeetingDate,
    getNextMeeting,
    getNextMeetingDate,
    formatChattanooga,
    formatLocal,
    getCountdown
  });
})(window);