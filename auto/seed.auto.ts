import { AdminModel } from "../models/admin.model";
import { RoleModel } from "../models/roles.model";
import { SystemInfoModel } from "../models/system-info.model";
import { TeamModel } from "../models/team.model";
import { AdminRole } from "../types/role.types";
import { SystemStatus } from "../types/system-info.types";
import { AccountStatus, IUser } from "../types/user.types";
import HTTPException from "../utils/error.utils";
import { HTTPStatus } from "../utils/http.utils";
import {
  DEFAULT_CURRENCIES,
  DEFAULT_ROLES,
  DEFAULT_TEAM,
  ROOT_USER,
  ROOT_USER_BVN,
} from "./constant";
import { db } from "../config/database";
import { CurrencyModel } from "../models/currency.model";
import { UserModel } from "../models/user.model";

export interface IRootUser extends IUser {
  middleName: string;
}

async function seedRoles() {
  try {
    // check if root user exists
    var roles = await RoleModel.find({});

    // if default roles do not exist
    if (!roles.length) {
      await RoleModel.create([...DEFAULT_ROLES]);

      console.log(`\x1b[32m%s\x1b[0m`, `Default roles created`);
    } else {
      console.log(`\x1b[32m%s\x1b[0m`, `Default roles already exist`);
    }
  } catch (error) {
    throw new HTTPException(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      "Default roles setup failed",
    );
  }
}

// async function seedAdmin() {
//   try {
//     // check if root user exists
//     var superAdmin = await AdminModel.findOne({
//       emailAddress: ROOT_USER.emailAddress,
//     });

//     if (!superAdmin) {
//       const superAdminRole = await RoleModel.findOne({
//         name: AdminRole.SUPERADMIN,
//       });

//       await AdminModel.create({
//         ...ROOT_USER,
//         bvn: ROOT_USER_BVN,
//         role: superAdminRole?.id,
//         status: AccountStatus.active,
//         password: ROOT_USER.password,
//       });

//       console.log(`\x1b[32m%s\x1b[0m`, `Default super admin created`);
//     }

//     console.log(`\x1b[32m%s\x1b[0m`, `Default super admin already exist`);
//   } catch (error) {
//     throw new HTTPException(
//       HTTPStatus.INTERNAL_SERVER_ERROR,
//       "Default super admin setup failed"
//     );
//   }
// }

// async function seedTeam() {
//   try {
//     // check if default team exists
//     var team = await TeamModel.findOne({ name: DEFAULT_TEAM.name });

//     // if default roles do not exist
//     if (!team) {
//       const superAdmin = await AdminModel.findOne({
//         emailAddress: ROOT_USER.emailAddress,
//       });

//       await TeamModel.create({
//         name: DEFAULT_TEAM.name,
//         createdBy: superAdmin?.id,
//       });

//       console.log(`\x1b[32m%s\x1b[0m`, `Default team created`);
//     } else {
//       console.log(`\x1b[32m%s\x1b[0m`, `Default team already exist`);
//     }
//   } catch (error) {
//     throw new HTTPException(
//       HTTPStatus.INTERNAL_SERVER_ERROR,
//       "Default team setup failed"
//     );
//   }
// }

async function seedSystemInfo() {
  try {
    // check if system info exists
    let systemInfo = await SystemInfoModel.findOne({});

    if (!systemInfo) {
      await SystemInfoModel.create({
        status: SystemStatus.OPERATIONAL,
        message: "System is operational",
      });
    }

    console.log(`\x1b[32m%s\x1b[0m`, `System info setup successful`);
  } catch (error) {
    throw new HTTPException(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      "System info setup failed",
    );
  }
}

async function seedCurrencies() {
  try {
    // checks if currencies exist
    const currencies = await CurrencyModel.find();

    if (currencies.length === 0) {
      const promises = DEFAULT_CURRENCIES.map(async (currency) => {
        await CurrencyModel.create({
          name: currency.name,
          code: currency.code,
          symbol: currency.symbol,
        });
      });

      await Promise.all(promises);
    }

    // console in color green
    console.log("Currency seed created");
  } catch (error) {
    throw new HTTPException(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      "Error creating currency seed",
    );
  }
}

// async function seedRootUser() {
//   try {
//     // check if root user exists
//     var rootUser = await UserModel.findOne({
//       emailAddress: ROOT_USER.emailAddress,
//     });

//     if (!rootUser) {
//       await UserModel.create({
//         ...ROOT_USER,
//       });
//     }
//   } catch (error) {
//     throw new HTTPException(
//       HTTPStatus.INTERNAL_SERVER_ERROR,
//       "Default root user setup failed"
//     );
//   }
// }

async function main() {
  db.on("connected", async () => {
    await seedRoles();
    // await seedAdmin();
    // await seedTeam();
    await seedSystemInfo();
    await seedCurrencies();
    // await seedRootUser();
  });
}

main();
