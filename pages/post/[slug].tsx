import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import PortableText from "react-portable-text";
import Header from "../../components/Header";
import { sanityClient } from "../../sanity";
import { Comment, Post } from "../../typings";
import { SubmitHandler, useForm } from "react-hook-form";
import { fetchComments } from "../../utils/fetchComments";
import toast from "react-hot-toast";

interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

interface Props {
  post: Post;
}

const Post = ({ post }: Props) => {
  const [comments, setComments] = useState<Comment[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IFormInput>();

  const refreshComments = async () => {
    try {
      const comments: Comment[] = await fetchComments(post._id);
      setComments(comments);
    } catch (error) {
      console.log(error, "error");
    }
  };

  useEffect(() => {
    refreshComments();
  }, []);

  useEffect(() => {}, [comments]);

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    const commentToast = toast.loading("Posting Comment...");
    fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
    reset();
    toast.success("Comment Posted!", {
      id: commentToast,
    });
    refreshComments();
  };

  return (
    <>
      <Header />
      <main>
        <img src={post.mainImage} alt="" className="object-cover w-full h-40" />
        <article className="max-w-3xl p-5 mx-auto">
          <h1 className="mt-10 mb-3 text-xl">{post.title}</h1>
          <h2 className="mb-2 text-xl font-light text-gray-500">
            {post.description}
          </h2>

          <div className="flex items-center space-x-2">
            <img
              loading="lazy"
              src={post.author.image}
              alt=""
              className="object-contain w-10 h-10 rounded-full"
            />
            <p className="text-sm font-extralight">
              Blog post by{" "}
              <span className="text-green-600 text-bold">
                {post.author.name}
              </span>{" "}
              - Publishes at {new Date(post._createdAt).toLocaleString()}
            </p>
          </div>
          <div className="mt-10">
            <PortableText
              className=""
              dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
              projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
              content={post.body}
              serializers={{
                h1: (props: any) => (
                  <h1 className="my-5 text-2xl fonr-bold" {...props} />
                ),
                h2: (props: any) => (
                  <h1 className="my-5 text-xl fonr-bold" {...props} />
                ),
                li: (children: any) => (
                  <li className="ml-4 list-disc">{children}</li>
                ),
                link: ({ href, children }: any) => (
                  <a href={href} className="text-blue-500 hover:underline">
                    {children}
                  </a>
                ),
              }}
            />
          </div>
        </article>

        <hr className="max-w-lg mx-auto my-5 border border-yellow-500" />

        <input type="hidden" {...register("_id")} name="_id" value={post._id} />

        <form
          className="flex flex-col max-w-2xl p-5 mx-auto mb-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
          <h4 className="text-2xl font-bold">Leave a comment below!</h4>
          <hr className="py-3 mt-2" />
          <label className="block mb-5">
            <span className="text-gray-700">Name</span>
            <input
              {...register("name", { required: true })}
              className="form"
              type="text"
              placeholder="Enter your name..."
            />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Email</span>
            <input
              {...register("email", { required: true })}
              className="form"
              type="email"
              placeholder="Enter your email..."
            />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Comment</span>
            <textarea
              {...register("comment", { required: true })}
              className="form"
              placeholder="Leave a comment..."
              rows={8}
            />
          </label>

          {/* Form validation errors*/}
          <div className="flex flex-col p-5 ">
            {errors.name && (
              <span className="text-sm text-red-500">
                - The Name Field is required
              </span>
            )}{" "}
            {errors.email && (
              <span className="text-sm text-red-500">
                - The Email Field is required
              </span>
            )}{" "}
            {errors.comment && (
              <span className="text-sm text-red-500">
                - The Comment Field is required
              </span>
            )}
          </div>

          <input
            type="submit"
            className="px-4 py-2 font-bold text-white bg-yellow-500 rounded shadow hover:bg-yellow-400 focus:shadow-outline focus:outline-none cursor:pointer"
          />
        </form>

        {/* Comments */}
        <div className="flex flex-col max-w-3xl p-10 mx-auto my-10 space-y-2 shadow shadow-yellow-500">
          <h3 className="text-4xl">Comments</h3>
          <hr className="py-2" />
          {comments.map((comment: Comment) => (
            <div key={comment._id}>
              <p>
                <span className="mr-1 text-yellow-500">{comment.name}:</span>{" "}
                {comment.comment}
              </p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default Post;

export const getStaticPaths = async () => {
  const query = `*[_type == "post"] {
    _id,
      slug {
        current
      }
    }
    `;

  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({
  params: { slug },
}: any) => {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    _createdAt,
    title,
    author -> {
      name, image
    },
    "comments": *[
      _type == "comment" &&
      post._ref == ^._id
    ],
    description,
    mainImage,
    slug,
    body
  }`;

  const post = await sanityClient.fetch(query, { slug });

  if (!post) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      post,
    },
    revalidate: 60, //after 60 seconds, it will reupdate the old cache version
  };
};
