import registerStart from "./start.js";
import registerCheck from "./check.js";
import registerDateTime from "./dateTime.js";
import registerHealth from "./health.js";

export default function registerAll(bot) {
  registerStart(bot);
  registerCheck(bot);
  registerDateTime(bot);
  registerHealth(bot);
}
