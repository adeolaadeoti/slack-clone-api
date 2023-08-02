import mongoose from "mongoose";

interface OrganisationSchemaType {
  owner: mongoose.Schema.Types.ObjectId;
  name: string;
  hobbies: string[];
  coWorkers: string[];
}

const organisationSchema = new mongoose.Schema<OrganisationSchemaType>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please enter your organisation name"],
    },
    coWorkers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Organisation", organisationSchema);
