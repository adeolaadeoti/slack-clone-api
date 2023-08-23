import Conversations from "../models/conversations";

export default async function updateUserStatus(id, isOnline) {
  await Conversations.findOneAndUpdate(
    { collaborators: { $in: id } },
    { isOnline },
    { new: true }
  ).populate("collaborators");
}
