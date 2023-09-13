import mongoose from "mongoose";
// import Organisation from "../models/organisation";
// import Conversation from "../models/conversations";

export default async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${(error as any).message}`);
    process.exit(1);
  }
}



// async function runOrganisationMigration() {
//   try {
//     const organisations = await Organisation.find({}).populate("coWorkers");
//     for (const organisation of organisations) {
//       for (const coWorker of organisation.coWorkers) {
//         await Conversation.create({
//           name: `${coWorker.username}`,
//           description: `This conversation is just between ${coWorker.username} and you`,
//           createdBy: coWorker,
//           organisation: organisation._id,
//           collaborators: [coWorker._id],
//         });
//       }
//     }
//   } catch (error) {
//     console.error(`Error: ${(error as any).message}`);
//     process.exit(1);
//   }
// }

// runOrganisationMigration();
