import { describe, it, expect, vi } from 'vitest';
import { calculateStreak, calculateTotalPoints } from './stats';
// No need to import parseDate from helpers, stats.js uses it internally.
// formatDate is used for log keys, but we'll use string keys directly in tests.

// Mocking isHabitScheduledForDate for predictable testing of calculateStreak
// This is a simplified mock. A more complex app might need more robust mocking or to test isHabitScheduledForDate separately.
vi.mock('./helpers', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // Mock isHabitScheduledForDate:
    // For these tests, we'll assume a habit is scheduled if its scheduleType is 'daily'
    // and the date is on or after its startDate.
    // More complex scheduling (specific_days, frequency_weekly) would need more sophisticated mock or direct testing of helpers.js
    isHabitScheduledForDate: (habit, date) => {
      if (!habit.startDate) return true; // Default to scheduled if no start date for simplicity in some tests
      const habitStartDate = new Date(habit.startDate);
      habitStartDate.setHours(0,0,0,0);
      const checkDate = new Date(date);
      checkDate.setHours(0,0,0,0);

      if (checkDate < habitStartDate) return false;

      if (habit.scheduleType === 'specific_days') {
        if (!habit.scheduleDays || habit.scheduleDays.length === 0) return false;
        return habit.scheduleDays.includes(checkDate.getDay()); // 0 for Sunday, 1 for Monday, etc.
      }
      // Default to daily for these tests if not 'specific_days'
      return true; // Simplified for testing streaks primarily
    },
    // formatDate needs to be consistent for log keys
    formatDate: (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    parseDate: (dateString) => {
        if (!dateString) return null;
        const parts = dateString.split('-');
        if (parts.length !== 3) return null;
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const day = parseInt(parts[2], 10);
        if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
        const date = new Date(year, month, day);
        if (isNaN(date.getTime())) return null;
        return date;
    }
  };
});


// Consistent 'today' for streak calculations. Logs will be relative to this.
// Tests will assume 'today' is 2023-10-04 for consistency.
// calculateStreak iterates backwards from 'new Date()'. We need to control this.
vi.useFakeTimers();
vi.setSystemTime(new Date('2023-10-04T00:00:00.000Z')); // Wednesday

describe('calculateStreak', () => {
  afterEach(() => {
    vi.restoreAllMocks(); // Restore mocks after each test
  });

  const baseHabit = { id: 'habit1', type: 'good', scheduleType: 'daily', startDate: '2023-01-01' };

  it('should return 0 for a new habit with no logs', () => {
    const { currentStreak } = calculateStreak(baseHabit, {});
    expect(currentStreak).toBe(0);
  });

  it('should return 0 for habit with empty habitLog', () => {
    const { currentStreak } = calculateStreak(baseHabit, { '2023-10-01': {} });
    expect(currentStreak).toBe(0);
  });

  it('should calculate a 3-day streak for a daily good habit', () => {
    const habitLog = {
      '2023-10-03': { habit1: true }, // Tue
      '2023-10-02': { habit1: true }, // Mon
      '2023-10-01': { habit1: true }, // Sun
    };
    const { currentStreak } = calculateStreak(baseHabit, habitLog);
    expect(currentStreak).toBe(3);
  });

  it('should break streak on a missed day for daily good habit', () => {
    const habitLog = {
      '2023-10-03': { habit1: true },
      '2023-10-02': { habit1: false }, // Streak broken here
      '2023-10-01': { habit1: true },
    };
    const { currentStreak } = calculateStreak(baseHabit, habitLog);
    expect(currentStreak).toBe(1); // Only 2023-10-03 counts
  });

  it('should break streak if a scheduled day is not logged', () => {
    const habitLog = {
      '2023-10-03': { habit1: true },
      // '2023-10-02' is missing (scheduled but not logged)
      '2023-10-01': { habit1: true },
    };
    // Assuming 'today' is 2023-10-04.
    // isHabitScheduledForDate mock will say 2023-10-02 was scheduled.
    const { currentStreak } = calculateStreak(baseHabit, habitLog);
    expect(currentStreak).toBe(1); // Only 2023-10-03
  });

  it('good habit on specific days (Mon, Wed, Fri) - successful streak', () => {
    const habit = { ...baseHabit, scheduleType: 'specific_days', scheduleDays: [1, 3, 5] }; // Mon, Wed, Fri
    vi.setSystemTime(new Date('2023-10-07T00:00:00.000Z')); // Saturday, after the logs
    const habitLog = {
      '2023-10-06': { habit1: true }, // Fri - Success
      // '2023-10-05' (Thu) - Not scheduled, skipped
      '2023-10-04': { habit1: true }, // Wed - Success
      // '2023-10-03' (Tue) - Not scheduled, skipped
      '2023-10-02': { habit1: true }, // Mon - Success
    };
    const { currentStreak } = calculateStreak(habit, habitLog);
    expect(currentStreak).toBe(3);
  });

  it('good habit on specific days (Mon, Wed, Fri) - streak broken', () => {
    const habit = { ...baseHabit, scheduleType: 'specific_days', scheduleDays: [1, 3, 5] }; // Mon, Wed, Fri
    vi.setSystemTime(new Date('2023-10-07T00:00:00.000Z')); // Saturday
    const habitLog = {
      '2023-10-06': { habit1: true }, // Fri - Success
      '2023-10-04': { habit1: false },// Wed - Missed (scheduled)
      '2023-10-02': { habit1: true }, // Mon - Success
    };
    const { currentStreak } = calculateStreak(habit, habitLog);
    expect(currentStreak).toBe(1); // Only Friday counts
  });

  it('bad habit (avoidance) - successful streak', () => {
    const habit = { ...baseHabit, type: 'bad' };
    const habitLog = {
      '2023-10-03': { habit1: false }, // Avoided
      '2023-10-02': { habit1: false }, // Avoided
    };
    const { currentStreak } = calculateStreak(habit, habitLog);
    expect(currentStreak).toBe(2);
  });

  it('bad habit (avoidance) - streak broken', () => {
    const habit = { ...baseHabit, type: 'bad' };
    const habitLog = {
      '2023-10-03': { habit1: false }, // Avoided
      '2023-10-02': { habit1: true },  // Not avoided (indulged)
      '2023-10-01': { habit1: false }, // Avoided
    };
    const { currentStreak } = calculateStreak(habit, habitLog);
    expect(currentStreak).toBe(1); // Only 2023-10-03
  });

  it('measurable good habit - streak when goal met', () => {
    const habit = { ...baseHabit, isMeasurable: true, goal: 30 };
    const habitLog = {
      '2023-10-03': { habit1: 35 }, // Goal met
      '2023-10-02': { habit1: 30 }, // Goal met
    };
    const { currentStreak } = calculateStreak(habit, habitLog);
    expect(currentStreak).toBe(2);
  });

  it('measurable good habit - streak broken when goal not met', () => {
    const habit = { ...baseHabit, isMeasurable: true, goal: 30 };
    const habitLog = {
      '2023-10-03': { habit1: 35 }, // Goal met
      '2023-10-02': { habit1: 29 }, // Goal NOT met
      '2023-10-01': { habit1: 30 },
    };
    const { currentStreak } = calculateStreak(habit, habitLog);
    expect(currentStreak).toBe(1);
  });

  it('measurable bad habit - streak when value below goal', () => {
    const habit = { ...baseHabit, type: 'bad', isMeasurable: true, goal: 50 }; // e.g. spend < 50
    const habitLog = {
      '2023-10-03': { habit1: 40 }, // Avoided (met condition)
      '2023-10-02': { habit1: 49 }, // Avoided
    };
    const { currentStreak } = calculateStreak(habit, habitLog);
    expect(currentStreak).toBe(2);
  });

  it('measurable bad habit - streak broken when value at or above goal', () => {
    const habit = { ...baseHabit, type: 'bad', isMeasurable: true, goal: 50 };
    const habitLog = {
      '2023-10-03': { habit1: 40 }, // Avoided
      '2023-10-02': { habit1: 50 }, // NOT avoided (broke streak)
      '2023-10-01': { habit1: 30 },
    };
    const { currentStreak } = calculateStreak(habit, habitLog);
    expect(currentStreak).toBe(1);
  });

  it('streak should not count before habit startDate', () => {
    const habit = { ...baseHabit, startDate: '2023-10-02' };
    const habitLog = {
      '2023-10-03': { habit1: true },
      '2023-10-02': { habit1: true },
      '2023-10-01': { habit1: true }, // Before start date
      '2023-09-30': { habit1: true }, // Before start date
    };
    // Today is 2023-10-04
    const { currentStreak } = calculateStreak(habit, habitLog);
    expect(currentStreak).toBe(2); // 2023-10-03, 2023-10-02
  });

  it('streak continues if a day is not scheduled (due to specific_days)', () => {
    // Today is Wed 2023-10-04
    const habit = { ...baseHabit, scheduleType: 'specific_days', scheduleDays: [0, 2, 4], startDate: '2023-10-01' }; // Sun, Wed, Fri
    const habitLog = {
        '2023-10-04': { habit1: true }, // Wed (Today) - Scheduled & Done
        // '2023-10-03' (Tue) - Not scheduled by habit.scheduleDays
        // '2023-10-02' (Mon) - Not scheduled by habit.scheduleDays
        '2023-10-01': { habit1: true }, // Sun - Scheduled & Done
    };
    // Expect streak to be 2 (Oct 4th, Oct 1st), skipping Mon/Tue
    const { currentStreak } = calculateStreak(habit, habitLog);
    expect(currentStreak).toBe(2);
  });

  it('streak breaks if a non-logged day WAS scheduled (specific_days)', () => {
    // Today is Fri 2023-10-06
    vi.setSystemTime(new Date('2023-10-06T00:00:00.000Z'));
    const habit = { ...baseHabit, scheduleType: 'specific_days', scheduleDays: [0, 2, 4], startDate: '2023-10-01' }; // Sun, Wed, Fri
    const habitLog = {
        // '2023-10-04' (Wed) - Scheduled by habit.scheduleDays BUT NOT LOGGED
        '2023-10-01': { habit1: true }, // Sun - Scheduled & Done
    };
    // Streak should be 0, because 2023-10-04 was scheduled but not done.
    // The loop starts from 2023-10-06 (Fri) - not logged, but also not explicitly scheduled as per mock.
    // This needs careful check of mock for isHabitScheduledForDate for specific_days.
    // Our mock for isHabitScheduledForDate for specific_days is: habit.scheduleDays.includes(checkDate.getDay())
    // So 2023-10-06 (Fri, day 5) is NOT scheduled by [0,2,4].
    // 2023-10-05 (Thu, day 4) IS scheduled. If not logged, it breaks.
    // Let's adjust "today" to be 2023-10-05 for this test.
    vi.setSystemTime(new Date('2023-10-05T00:00:00.000Z')); // Today is Thursday (day 4)
     const habitLogForMiss = {
        // '2023-10-04' (Wed, day 3) - Not logged, but scheduled.
        // '2023-10-02' (Mon, day 1) - Not scheduled
        '2023-10-01': { habit1: true }, // Sun - Scheduled & Done
    };
    // Streak for 2023-10-05 (Thu, day 4) is 0 because it's not logged. It was scheduled.
    // The previous successful was 2023-10-01.
    // But 2023-10-04 (Wed, day 3) IS scheduled by [0,2,4] and NOT logged. So streak broken before 2023-10-01.
    const { currentStreak } = calculateStreak(habit, habitLogForMiss);
    expect(currentStreak).toBe(0);
  });

});


describe('calculateTotalPoints', () => {
  const habitGoodNonMeasurable = { id: 'h1', type: 'good', isMeasurable: false, startDate: '2023-01-01' };
  const habitGoodMeasurable = { id: 'h2', type: 'good', isMeasurable: true, goal: 10, unit: 'min', startDate: '2023-01-01' };
  const habitBadNonMeasurable = { id: 'h3', type: 'bad', isMeasurable: false, startDate: '2023-01-01' };
  const habitBadMeasurable = { id: 'h4', type: 'bad', isMeasurable: true, goal: 5, unit: 'times', startDate: '2023-01-01' }; // Goal: < 5 times

  it('should return 0 if there are no habits or no logs', () => {
    expect(calculateTotalPoints([], {})).toBe(0);
    expect(calculateTotalPoints([habitGoodNonMeasurable], {})).toBe(0);
    expect(calculateTotalPoints([], { '2023-01-01': { h1: true } })).toBe(0);
  });

  it('good, non-measurable: completed once (+10 points)', () => {
    const habits = [habitGoodNonMeasurable];
    const habitLog = { '2023-10-01': { h1: true } };
    expect(calculateTotalPoints(habits, habitLog)).toBe(10);
  });

  it('good, non-measurable: completed multiple times', () => {
    const habits = [habitGoodNonMeasurable];
    const habitLog = {
      '2023-10-01': { h1: true },
      '2023-10-02': { h1: true },
      '2023-10-03': { h1: false }, // Not completed
    };
    expect(calculateTotalPoints(habits, habitLog)).toBe(20);
  });

  it('good, measurable: goal met (+10 points)', () => {
    const habits = [habitGoodMeasurable];
    const habitLog = { '2023-10-01': { h2: 10 } };
    expect(calculateTotalPoints(habits, habitLog)).toBe(10);
  });

  it('good, measurable: goal exceeded (+10 points)', () => {
    const habits = [habitGoodMeasurable];
    const habitLog = { '2023-10-01': { h2: 15 } };
    expect(calculateTotalPoints(habits, habitLog)).toBe(10);
  });

  it('good, measurable: goal not met (0 points from this log)', () => {
    const habits = [habitGoodMeasurable];
    const habitLog = { '2023-10-01': { h2: 5 } };
    expect(calculateTotalPoints(habits, habitLog)).toBe(0);
  });

  it('good, measurable: invalid log (0 points from this log)', () => {
    const habits = [habitGoodMeasurable];
    const habitLog = { '2023-10-01': { h2: true } }; // Log is boolean, not number
    expect(calculateTotalPoints(habits, habitLog)).toBe(0);
  });


  it('bad, non-measurable: avoided (+10 points)', () => {
    const habits = [habitBadNonMeasurable];
    const habitLog = { '2023-10-01': { h3: false } };
    expect(calculateTotalPoints(habits, habitLog)).toBe(10);
  });

  it('bad, non-measurable: not avoided (0 points)', () => {
    const habits = [habitBadNonMeasurable];
    const habitLog = { '2023-10-01': { h3: true } };
    expect(calculateTotalPoints(habits, habitLog)).toBe(0);
  });

  it('bad, measurable: value below goal (+10 points)', () => {
    const habits = [habitBadMeasurable]; // goal < 5
    const habitLog = { '2023-10-01': { h4: 3 } };
    expect(calculateTotalPoints(habits, habitLog)).toBe(10);
  });

  it('bad, measurable: value at goal (0 points)', () => {
    const habits = [habitBadMeasurable]; // goal < 5
    const habitLog = { '2023-10-01': { h4: 5 } };
    expect(calculateTotalPoints(habits, habitLog)).toBe(0);
  });

  it('bad, measurable: value above goal (0 points)', () => {
    const habits = [habitBadMeasurable]; // goal < 5
    const habitLog = { '2023-10-01': { h4: 6 } };
    expect(calculateTotalPoints(habits, habitLog)).toBe(0);
  });

  it('bad, measurable: invalid log (0 points)', () => {
    const habits = [habitBadMeasurable]; // goal < 5
    const habitLog = { '2023-10-01': { h4: false } }; // Log is boolean
    expect(calculateTotalPoints(habits, habitLog)).toBe(0);
  });

  it('multiple habits and logs, summing correctly', () => {
    const habits = [habitGoodNonMeasurable, habitGoodMeasurable, habitBadNonMeasurable, habitBadMeasurable];
    const habitLog = {
      '2023-10-01': {
        h1: true,  // +10
        h2: 15,  // +10 (goal 10)
        h3: false, // +10
        h4: 3,   // +10 (goal < 5)
      },
      '2023-10-02': {
        h1: false, // 0
        h2: 5,   // 0 (goal 10)
        h3: true,  // 0
        h4: 6,   // 0 (goal < 5)
      },
      '2023-10-03': {
        h1: true,  // +10
        h4: 1,   // +10 (goal < 5)
        h5: true,  // Unrelated habit, ignored
      },
    };
    expect(calculateTotalPoints(habits, habitLog)).toBe(60); // 40 from day1, 20 from day3
  });

  it('should ignore log entries for habits not in the habits array', () => {
    const habits = [habitGoodNonMeasurable];
    const habitLog = {
      '2023-10-01': { h1: true, unknownHabit: true }, // +10 for h1
    };
    expect(calculateTotalPoints(habits, habitLog)).toBe(10);
  });

  it('should handle habit with missing goal for measurable type (treat as no points)', () => {
    const habitNoGoal = { id: 'h_no_goal', type: 'good', isMeasurable: true, unit: 'count', startDate: '2023-01-01' }; // No goal defined
    const habits = [habitNoGoal];
    const habitLog = { '2023-10-01': { h_no_goal: 5 } };
    expect(calculateTotalPoints(habits, habitLog)).toBe(0);

    const habitBadNoGoal = { id: 'hb_no_goal', type: 'bad', isMeasurable: true, unit: 'count', startDate: '2023-01-01' }; // No goal defined
    const habitsBad = [habitBadNoGoal];
    const habitLogBad = { '2023-10-01': { hb_no_goal: 2 } };
    expect(calculateTotalPoints(habitsBad, habitLogBad)).toBe(0);
  });

});
