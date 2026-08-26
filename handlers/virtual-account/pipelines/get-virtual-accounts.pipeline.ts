export const getVirtualAccountsPipeline = ({
  query,
}: {
  query: Record<string, any>;
}) => {
  const { accountNumber, phoneNumber, username } = query;

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
              firstName: 1,
              lastName: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$user",
    },
    {
      $lookup: {
        from: "currencies",
        localField: "currency",
        foreignField: "_id",
        as: "currency",
        pipeline: [
          {
            $project: {
              name: 1,
              code: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$currency",
    },
    ...(accountNumber
      ? [
          {
            $match: {
              accountNumber: { $regex: accountNumber, $options: "i" },
            },
          },
        ]
      : []),

    ...(phoneNumber
      ? [
          {
            $match: {
              "user.phoneNumber": { $regex: phoneNumber, $options: "i" },
            },
          },
        ]
      : []),

    ...(username
      ? [
          {
            $match: {
              "user.username": { $regex: username, $options: "i" },
            },
          },
        ]
      : []),
  ];
};
