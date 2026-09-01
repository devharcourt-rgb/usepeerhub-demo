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
  DEFAULT_CRYPTO_ASSETS,
  DEFAULT_CURRENCIES,
  DEFAULT_ROLES,
  ROOT_USER,
} from "./constant";
import { db } from "../config/database";
import { CurrencyModel } from "../models/currency.model";
import { UserModel } from "../models/user.model";
import { CryptoAssetModel } from "../models/crypto-asset.model";

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

async function seedAdmin() {
  try {
    // check if the default super admin exists
    const superAdmin = await AdminModel.findOne({
      emailAddress: ROOT_USER.emailAddress,
    });

    if (!superAdmin) {
      const superAdminRole = await RoleModel.findOne({
        name: AdminRole.SUPERADMIN,
      });

      // seedRoles() runs first, so a missing role means that seed failed —
      // creating the admin without one leaves it unusable
      if (!superAdminRole) {
        throw new HTTPException(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          `${AdminRole.SUPERADMIN} role not found`,
        );
      }

      await AdminModel.create({
        ...ROOT_USER,
        role: superAdminRole.id,
        status: AccountStatus.active,
      });

      console.log(`\x1b[32m%s\x1b[0m`, `Default super admin created`);
    } else {
      console.log(`\x1b[32m%s\x1b[0m`, `Default super admin already exist`);
    }
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    throw new HTTPException(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      "Default super admin setup failed",
    );
  }
}

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

/**
 * Seeds the crypto asset catalog's reference metadata (symbol, network,
 * standard, decimals, ...) from DEFAULT_CRYPTO_ASSETS.
 *
 * Deliberately per-item upsert with $setOnInsert rather than a bulk
 * create-if-empty like seedCurrencies() — this is safe to re-run after an
 * admin has already configured real addresses/rates: it only fills in
 * assets that don't exist yet (matched on symbol+network+standard, the
 * model's unique index) and never touches an existing row's fields.
 *
 * Every seeded row still needs an admin to set the real deposit address
 * (and contract address, for tokens) and a rate, then flip it active — see
 * DEFAULT_CRYPTO_ASSETS's UNSET_ADDRESS placeholder in auto/constant.ts.
 */
async function seedCryptoAssets() {
  try {
    let createdCount = 0;

    for (const asset of DEFAULT_CRYPTO_ASSETS) {
      const { symbol, network, standard, ...rest } = asset;

      const result = await CryptoAssetModel.updateOne(
        { symbol, network, standard },
        { $setOnInsert: { symbol, network, standard, ...rest, active: true } },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        createdCount++;
      }
    }

    console.log(
      `\x1b[32m%s\x1b[0m`,
      createdCount > 0
        ? `Crypto asset seed created ${createdCount} new asset(s)`
        : `Crypto asset seed already up to date`,
    );
  } catch (error) {
    throw new HTTPException(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      "Error creating crypto asset seed",
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
    await seedAdmin();
    // await seedTeam();
    await seedSystemInfo();
    await seedCurrencies();
    await seedCryptoAssets();
    // await seedRootUser();
  });
}

main();
