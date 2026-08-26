import { NextFunction, Request, Response } from "express";
import { getUser, isSuperAdmin } from "../../../utils/core.utils";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { TeamModel } from "../../../models/team.model";
import mongoose from "mongoose";

async function updateTeamHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name } = req.body;
  const { id } = req.params;
  const { userId } = getUser(req);

  try {
    await isSuperAdmin(userId);

    const team = await TeamModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
      },
      {
        name,
      },
      { new: true }
    );

    if (!team) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Team with this name does not exist"
      );
    }

    return res.status(HTTPStatus.CREATED).json({
      message: "Team updated successfully",
      data: team,
    });
  } catch (error) {
    next(error);
  }
}

export default updateTeamHandler;
