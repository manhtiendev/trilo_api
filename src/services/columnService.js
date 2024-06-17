import { boardModel } from "~/models/boardModel";
import { columnModel } from "~/models/columnModel";

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newColumn = {
      ...reqBody,
    };

    const createdColumn = await columnModel.createNew(newColumn);

    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId);

    if (getNewColumn) {
      getNewColumn.cards = [];
      await boardModel.pushColumnOderIds(getNewColumn);
    }

    return getNewColumn;
  } catch (error) {
    throw error;
  }
};

export const columnService = {
  createNew,
};