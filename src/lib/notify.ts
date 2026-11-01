import * as Notifications from 'expo-notifications';
import type { Profile } from '../types.ts';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
});

const NUDGES = [
  'Your 10 minutes beat zero minutes. Let\'s go.',
  'Don\'t break the chain. Short session, big win.',
  'Coach says: show up today, results follow.',
  'Sweat now, thank yourself tonight.',
];

// Next 14 days as one-off reminders on the user's chosen days; today's is skipped once done.
// Re-run on app open and after each workout so the window keeps rolling.
export async function schedule(p: Profile, doneToday: boolean) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return false;
  const [hour, minute] = p.time.split(':').map(Number);
  const now = new Date();
  const jobs = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, minute);
    if (!p.days.includes(date.getDay() + 1) || date <= now || (i === 0 && doneToday)) continue;
    jobs.push(Notifications.scheduleNotificationAsync({
      content: { title: 'FitHome workout time', body: NUDGES[i % NUDGES.length] },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
    }));
  }
  await Promise.all(jobs);
  return true;
}
