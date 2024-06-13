import { StatusCodes } from "http-status-codes";
import slugify from "slugify";
import { boardModel } from "~/models/boardModel";
import ApiError from "~/utils/ApiError";

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title, {
        locale: "vi",
        lower: true,
      }),
    };

    const createdBoard = await boardModel.createNew(newBoard);

    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId);

    return getNewBoard;
  } catch (error) {
    throw error;
  }
};

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId);
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Board not found!");
    }

    return board;
  } catch (error) {
    throw new Error(error);
  }
};

export const boardService = {
  createNew,
  getDetails,
};
