export const getToday = () =>
  new Date().toISOString().split("T")[0];

export const getWeekKey = () => {
  const d = new Date();
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(
    (((d.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7
  );
  return `${d.getFullYear()}-${week}`;
};

export const getMonthKey = () =>
  `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}`;