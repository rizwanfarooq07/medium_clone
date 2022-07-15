import type { GetServerSideProps } from "next";
import Link from "next/link";
import Banner from "../components/Banner";
import Header from "../components/Header";
import { urlFor } from "../sanity";
import { Post } from "../typings";
import { fetchPosts } from "../utils/fetchPosts";
import { Toaster } from "react-hot-toast";

interface Props {
  posts: Post[];
}

const Home = ({ posts }: Props) => {
  return (
    <div className="max-w-6xl mx-auto">
      <Header />

      <Banner />

      {/* Posts */}
      <div className="grid grid-cols-1 gap-3 p-2 md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:p-6">
        {posts.map((post) => (
          <Link key={post._id} href={`/post/${post.slug.current}`}>
            <div className="overflow-hidden border rounded-lg cursor-pointer group">
              <img
                loading="lazy"
                className="object-contain w-full transition-transform duration-200 ease-in-out h-60 group-hover:scale-105"
                src={post?.mainImage}
                alt=""
              />
              <div className="flex justify-between p-5 bg-white">
                <div>
                  <p className="text-lg font-bold">{post.title}</p>
                  <p className="text-xs">
                    {post.description} by {post.author.name}
                  </p>
                </div>
                <div>
                  <img
                    loading="lazy"
                    src={post.author.image}
                    alt=""
                    className="object-contain w-12 h-12 rounded-full"
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const posts = await fetchPosts();

  return {
    props: {
      posts,
    },
  };
};
