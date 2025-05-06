const HdAction = require("../models/HDAction");

const pad = (num, size) => num.toString().padStart(size, "0");

const generateCustomId = async (npk) => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const todayCount = await HdAction.countDocuments({
    npk,
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  });

  const numberPart = pad(todayCount + 1, 4);

  return `HDREQ-${npk}-${datePart}-${numberPart}`;
};

module.exports = generateCustomId;
