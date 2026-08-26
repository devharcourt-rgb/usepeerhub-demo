import { NextFunction, Request, Response } from "express";
import { getUser, isSuperAdmin } from "../../../utils/core.utils";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { TeamModel } from "../../../models/team.model";

async function createTeamHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name } = req.body;
  const { userId } = getUser(req);

  try {
    await isSuperAdmin(userId);

    const existingTeam = await TeamModel.findOne({ name });

    if (existingTeam) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Team with this name already exists"
      );
    }

    const team = await TeamModel.create({
      name,
      createdBy: userId,
    });

    return res.status(HTTPStatus.CREATED).json({
      message: "Team created successfully",
      data: team,
    });
  } catch (error) {
    next(error);
  }
}

export default createTeamHandler;
