const { CronJob } = require("cron");
const { Op } = require("sequelize");
const Messages = require("../models/Messages");
const ArchivedChat = require("../models/ArchivedChat");

const archiveOldMessages = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const oldMessages = await Messages.findAll({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo,
        },
      },
    });

    if (oldMessages.length > 0) {
      await ArchivedChat.bulkCreate(
        oldMessages.map((msg) => ({
          message: msg.message,
          fileUrl: msg.fileUrl,
          senderName: msg.senderName,
          createdAt: msg.createdAt,
          userId: msg.userId,
          groupId: msg.groupId,
        }))
      );

      await Messages.destroy({
        where: {
          createdAt: {
            [Op.lt]: oneDayAgo,
          },
        },
      });

      console.log(`Archived ${oldMessages.length} old messages.`);
    } else {
      console.log("No messages to archive.");
    }
  } catch (error) {
    console.error("Error during archiving messages:", error);
  }
};

const job = new CronJob("* * * * *", async () => {
  console.log("Starting the archiving process...");
  await archiveOldMessages();
});

job.start();
