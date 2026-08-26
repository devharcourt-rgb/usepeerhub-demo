export const getTransactionsPipeline = ({
  query,
  search,
  field,
  order,
}: {
  search?: string;
  query: Record<string, any>;
  field: string;
  order: "asc" | "desc";
}) => {
  return [
    {
      $match: query,
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $match: search
              ? {
                  $or: [
                    { firstName: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                  ],
                }
              : {},
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
      },
    },
    {
      $unwind: "$currency",
    },
    {
      $project: {
        user: 1,
        amount: 1,
        type: 1,
        status: 1,
        currency: 1,
        createdAt: 1,
      },
    },
    {
      $sort: {
        [field]: order === "asc" ? 1 : -1,
      },
    },
  ];
};
