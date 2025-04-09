const mongoose = require("mongoose");

const hdActionSchema = new mongoose.Schema({
  npk: { type:String, required: true },
  request: { type: String, required: true },
  reason: { type: String, required: true, default: "-"  },
  action: { type: String, required: true, default: "-"  },
  rootCause: { type: String, required: true, default: "-" },
  status: { type: String, enum: ["Not Yet", "In Progress", "Done"], default: "Not Yet" },
  doneDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("HDAction", hdActionSchema);
