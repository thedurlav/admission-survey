const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    childName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    class: {
      type: String,
      required: true,
    },
    medium: {
      type: String,
      required: true,
      enum: ["Hindi", "English"],
    },
    previousSchool: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNo: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"],
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    surveyDate: {
      type: Date,
      default: Date.now,
    },
    surveyedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema);
