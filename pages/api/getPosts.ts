import type { NextApiRequest, NextApiResponse } from "next";
import { groq } from "next-sanity";
import { sanityClient } from "../../sanity";

type Data = {
  posts: any;
};

const feedQuery = groq`
*[_type == "post"]
{_id,title,slug,description,mainImage, body, author -> {
   name,
 image
                  }}
| order(_createdAt asc)
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const posts = await sanityClient.fetch(feedQuery);
  res.status(200).json({ posts });
}
