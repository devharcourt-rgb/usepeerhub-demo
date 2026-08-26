import { pipeline } from "stream";

async function getAllKycPipeline({
  skip,
  limit,
  search,
}: {
  skip: number;
  limit: number;
  search?: string;
}) {
  return [
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              emailAddress: 1,
              phoneNumber: 1,
              dateOfBirth: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$user",
    },
    ...(search
      ? [
          {
            $match: {
              $or: [
                {
                  "user.firstName": {
                    $regex: search,
                    $options: "i",
                  },
                },
                {
                  "user.lastName": {
                    $regex: search,
                    $options: "i",
                  },
                },
              ],
            },
          },
        ]
      : []),
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];
}

export default getAllKycPipeline;
