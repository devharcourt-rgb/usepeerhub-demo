import { NextFunction, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { getUser } from "../../utils/core.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { UserModel } from "../../models/user.model";
import { VirtualAccountService } from "../../services/virtualAccount.service";

async function countrySetHandler(req: any, res: Response, next: NextFunction) {
  const virtualAccountService = new VirtualAccountService();
  const { country } = req.body;
  const { userId } = getUser(req);
  try {
    if (!country) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Country is required"
      );
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "User with id not found");
    }
    user.country = country;
    await user.save();
     if(user.country == "Nigeria"){
       await virtualAccountService.generate(user, true);
     }
    return res.json({
      message: "Country Has been saved",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export default countrySetHandler;
