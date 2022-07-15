export const fetchComments = async (postId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}api/getComments?postId=${postId}`
  );
  const comments = await res.json();
  return comments;
};
