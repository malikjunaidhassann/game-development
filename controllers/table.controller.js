import { Table } from "../models/table.model.js";

const TableController = {
  async getAllTable(_, res) {
    const table = await Table.find();

    return res.status(200).json({
      success: true,
      data: table,
    });
  },
  async createTable(req, res) {
    const { tableName, entryFee, reward } = req.bodyValue;
    const { file } = req;

    const createdTable = await Table.create({
      tableName,
      entryFee,
      reward,
      image: file.location,
    });
    return res.status(201).json({
      success: true,
      data: createdTable,
    });
  },
  async editTable(req, res) {
    let tableId = req.params.tableId;
    const { tableName, entryFee, reward } = req.body;
    const file = req.file;

    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(401).json({ success: false, message: "Table not found." });
    }

    const update = {
      $set: {},
    };

    if (file && file.location) {
      update.$set.image = file.location;
    } else {
      update.$set.image = table.image; // Preserve the existing image URL
    }

    if (entryFee !== undefined) {
      update.$set.entryFee = entryFee;
    }

    if (tableName !== undefined) {
      update.$set.tableName = tableName;
    }

    if (reward !== undefined) {
      update.$set.reward = reward;
    }

    const options = { new: true };

    try {
      const updatedTable = await Table.findOneAndUpdate({ _id: tableId }, update, options);

      if (!updatedTable) {
        return res.status(404).json({ success: false, message: "Table does not exist." });
      }

      return res.status(200).json({ success: true, data: updatedTable });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the table.",
        error: error.message,
      });
    }
  },
  async inActiveTable(req, res) {
    let tableId = req.params.tableId;

    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(401).json({ success: false, message: "Table not found." });
    }

    const filter = { _id: tableId };
    const update = table.inactive
      ? {
          $set: {
            inactive: false,
          },
        }
      : {
          $set: {
            inactive: true,
          },
        };
    const options = { new: true };

    const updatedTable = await Table.findOneAndUpdate(filter, update, options);

    if (!updatedTable) return res.status(404).json({ success: false, message: "Table does not exists." });

    return res.status(200).json({
      success: true,
      message: `${table.inactive ? "Table has been activated" : "Table has been inactivated"}`,
      data: updatedTable,
    });
  },
};

export default TableController;
