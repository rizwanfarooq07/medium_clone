export default {
  name: "comment",
  title: "Comment",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "email",
      title: "Email",
      type: "string",
    },
    {
      name: "approved",
      title: "Approved",
      type: "boolean",
      description: "Comments won't show on the site without being approved",
    },
    {
      name: "comment",
      title: "Comment",
      type: "text",
    },
    {
      name: "post",
      type: "reference",
      to: { type: "post" },
    },
  ],
};
