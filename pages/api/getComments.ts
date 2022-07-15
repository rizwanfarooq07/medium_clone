import type { NextApiRequest, NextApiResponse } from "next";
import { groq } from "next-sanity";
import { sanityClient } from "../../sanity";

// type Data = {
//   posts: any;
// };

const feedQuery = groq`
*[_type == "comment" && references(*[_type== "post" && _id == $postId]._id)]{_id, ...} | order(_createdAt desc)
`;

type Data = Comment[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { postId } = req.query;

  const comments: Comment[] = await sanityClient.fetch(feedQuery, {
    postId,
  });

  res.status(200).json(comments);
}

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   {postId} = req.query
//   const comments = await sanityClient.fetch(feedQuery);
//   res.status(200).json({ comments });
// }
