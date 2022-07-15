export const fetchPosts = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/getPosts`);
  const { posts } = await res.json();
  return posts;
};
