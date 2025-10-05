import registerStart from "./start.js";
import registerCheck from "./checkNewspaper.js";
import registerDateTime from "./dateTime.js";
import registerHealth from "./healthCheck.js";
import registerMessage from "./messageSending.js";
import registerAskName from "./askName.js";
import registerButtons from "./buttonsCheck.js";
import registerPhoto from "./photoSending.js";
import registerDocument from "./documentsSending.js";
import registerSticker from "./stickerReply.js";
import registerUserTracker from "./totalUsers.js";

export default function registerAll(bot) {
  registerStart(bot); // /start
  registerCheck(bot); // /check
  registerDateTime(bot); // /date
  registerHealth(bot); // /time
  // registerMessage(bot);
  // registerAskName(bot);
  registerButtons(bot); //buttons
  registerPhoto(bot); // photo
  registerDocument(bot); // docs
  registerSticker(bot); // sticker
  registerUserTracker(bot); // /stats
}
