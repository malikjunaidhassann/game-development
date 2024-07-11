import Table from "../models/table.model.js";

const TableController = {
  async getAllTable(_, res) {
    const table = await Table.find();

    return res.status(200).json({
      success: true,
      data: table,
    });
  },
  async createTable(req, res) {
    const { tableName, entryFee, reward, image } = req.bodyValue;
    const createdTable = await Table.create({
      tableName,
      entryFee,
      reward,
      image,
    });
    return res.status(201).json({
      success: true,
      data: createdTable,
    });
  },
  async editTable(req, res) {
    let tableId = req.params.tableId;
    const { tableName, entryFee, reward, image } = req.body;
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(401).json({ success: false, message: "Table not found." });
    }

    const filter = { _id: tableId, inactive: false };
    const update = {
      $set: {
        tableName,
        entryFee,
        reward,
        image,
      },
    };
    const options = { new: true };

    const updatedTable = await Table.findOneAndUpdate(filter, update, options);

    if (!updatedTable) return res.status(404).json({ success: false, message: "Table does not exists." });

    return res.status(200).json({ success: true, data: updatedTable });
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
    });
  },
};

export default TableController;
