import { createHistory, getHistory } from "../services/historyService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const insertHistory = asyncHandler(async (req, res) => {
  const { id, status } = req.body;

  if (!id || !status) {
    return res.status(400).json({
      success: false,
      message: "ID dan status harus diisi",
    });
  }

  const user_id = req.user.id;
  await createHistory(user_id, id, status);

  res.status(201).json({
    success: true,
    message: "History berhasil dibuat",
  });
});

export const getAllHistory = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { dataHistory } = await getHistory(user_id);

  res.status(200).json({
    success: true,
    message: "Data history berhasil diambil",
    data: dataHistory,
  });
});
