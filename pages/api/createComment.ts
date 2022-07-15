import sanityClient from "@sanity/client";
import type { NextApiRequest, NextApiResponse } from "next";

const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  apiVersion: "2022-03-10",
  useCdn: process.env.NODE_ENV === "production",
  token: process.env.SANITY_API_TOKEN,
};

// const client = sanityClient(config);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { _id, name, email, comment } = JSON.parse(req.body);

  const mutations = {
    mutations: [
      {
        create: {
          _type: "comment",
          name: name,
          email: email,
          comment: comment,
          post: {
            _type: "reference",
            _ref: _id,
          },
        },
      },
    ],
  };

  const apiEndpint = `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${process.env.NEXT_PUBLIC_SANITY_DATASET}`;

  const result = await fetch(apiEndpint, {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
    },
    body: JSON.stringify(mutations),
    method: "POST",
  });

  const json = await result.json();

  res.status(200).json({ message: "Comment Added" });

  //   try {
  //     await client.create({
  //       _type: "comment",
  //       post: {
  //         _type: "reference",
  //         _ref: _id,
  //       },
  //     }),
  //       name,
  //       email,
  //       comment;
  //   } catch (err) {
  //     return res.status(500).json({ message: "Couldn't submit comment", err });
  //   }

  //   res.status(200).json({ message: "Comment Added" });

  //   console.log("comment submitted");
  //   return res.status(200).json({ message: "Comment submitted" });
}
