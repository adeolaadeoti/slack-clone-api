import mongoose from "mongoose";
// import Organisation from "../models/organisation";

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

// async function runOrganisationMigration(Organisation: any) {
//   try {
//     const organizations = await Organisation.find({});
//     for (const org of organizations) {
//       const url =
//         process.env.NODE_ENV === "development"
//           ? process.env.STAGING_URL
//           : process.env.PRODUCTION_URL;
//       const joinLink = `${url}/${org._id}`;
//       const newUrl = `${url}/${org.name}`;
//       await Organisation.updateOne(
//         { _id: org._id },
//         { $set: { url: newUrl, joinLink } }
//       );
//     }
//   } catch (error) {
//     process.exit(1);
//   }
// }
