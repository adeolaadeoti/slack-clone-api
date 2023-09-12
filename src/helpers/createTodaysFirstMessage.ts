import Message from "../models/message";

function formatDate(date) {
  const options = { weekday: "long", month: "long", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1); // Capitalize the first letter
}

export default async function createTodaysFirstMessage(
  channelId: string,
  organisation: string
) {
  try {
    // Check if there are any messages for today in the channel
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingMessages = await Message.find({
      channel: channelId,
      createdAt: { $gte: today },
    });

    if (existingMessages.length === 0) {
      await Message.create({
        organisation,
        content: formatDate(today),
        channel: channelId,
        hasRead: false,
        type: "date",
      });
    }
  } catch (error) {}
}
