import registerStart from "./start.js";
import registerCheck from "./checkNewspaper.js";
import registerDateTime from "./dateTime.js";
import registerHealth from "./healthCheck.js";
import registerMessage from "./messageSending.js";
import registerAskName from "./askName.js";
import registerButtons from "./buttonsCheck.js";
import registerErrorHandler from "./errorHandler.js";
import registerPhoto from "./photoSending.js";
import registerDocument from "./documentsSending.js";

export default function registerAll(bot) {
  registerStart(bot);
  registerCheck(bot);
  registerDateTime(bot);
  registerHealth(bot);
  registerMessage(bot);
  registerAskName(bot);
  registerButtons(bot);
  registerErrorHandler(bot);
  registerPhoto(bot);
  registerDocument(bot);
}
