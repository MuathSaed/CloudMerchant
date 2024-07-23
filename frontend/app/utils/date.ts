import { DateTime } from "luxon";

let customizeRelativeDate = (relativeDate: string | null) => {
  if (relativeDate) {
    return relativeDate
      .replace("hours", "hrs")
      .replace("hour", "hr")
      .replace("minutes", "min")
      .replace("minute", "min")
      .replace("seconds", "sec")
      .replace("second", "sec");
  }
};

export let formatDate = (dateString: string, format = "") => {
  let date = DateTime.fromISO(dateString);
  if (format) {
    return date.toFormat(format);
  }

  let now = DateTime.now();
  if (date.hasSame(now, "day")) {
    return customizeRelativeDate(date.toRelative());
  }
  else if (date.hasSame(now.minus({ days: 1 }), "day")) {
    return "Yesterday";
  }
  else if (date > now.minus({ days: 6 })) {
    return date.toFormat("EEE");
  } else {
    return date.toFormat("dd/MM/yy");
  }
};
