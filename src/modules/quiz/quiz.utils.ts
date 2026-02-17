export const getCurrentWeekKey = () => {
  const now = new Date();
  const firstJan = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000)
  );
  const week = Math.ceil((days + firstJan.getDay() + 1) / 7);

  return `${now.getFullYear()}-W${week}`;
};