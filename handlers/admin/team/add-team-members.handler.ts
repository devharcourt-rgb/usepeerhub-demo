import { NextFunction, Request, Response } from "express";
import { getUser, isSuperAdmin } from "../../../utils/core.utils";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { TeamModel } from "../../../models/team.model";
import { AdminModel } from "../../../models/admin.model";

async function addTeamMembersHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { members, team: teamId } = req.body as {
    members: string[];
    team: string;
  };
  const { userId } = getUser(req);

  try {
    await isSuperAdmin(userId);

    // loop through members and check if they are admins
    members.map(async (member) => {
      const admin = await AdminModel.findOne({
        _id: member,
      });

      if (!admin) {
        throw new HTTPException(
          HTTPStatus.BAD_REQUEST,
          "Admin with this id does not exist"
        );
      }
    });

    const team = await TeamModel.findOneAndUpdate(
      {
        _id: teamId,
      },
      {
        $push: {
          members: {
            $each: members,
          },
        },
      },
      {
        new: true,
      }
    );

    if (!team) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "Team not found");
    }

    return res.status(HTTPStatus.CREATED).json({
      message: "Members added to team",
      data: team,
    });
  } catch (error) {
    next(error);
  }
}

export default addTeamMembersHandler;
