const User = require("../models/User");
const Post = require("../models/Post");

async function seedDemoData() {
  const starterUsers = [
    { name: "Umar Zia", username: "umarzia", bio: "Welcome to my Socially profile!", avatarInitial: "U", isDemoUser: true },
    { name: "Ali Raza", username: "aliraza", bio: "Learning and building every day.", avatarInitial: "A" },
    { name: "Sara Malik", username: "saramalik", bio: "Sharing ideas and learning together.", avatarInitial: "S" },
    { name: "Ayesha Khan", username: "ayeshakhan", bio: "Technology enthusiast.", avatarInitial: "A" }
  ];

  for (const item of starterUsers) {
    await User.updateOne(
      { username: item.username },
      { $setOnInsert: item, ...(item.username === "umarzia" ? { $set: { isDemoUser: true } } : {}) },
      { upsert: true }
    );
  }

  const count = await Post.countDocuments();
  if (count === 0) {
    const all = await User.find({ username: { $in: ["umarzia", "aliraza", "saramalik", "ayeshakhan"] } });
    const byUsername = Object.fromEntries(all.map(u => [u.username, u]));

    await Post.create([
      {
        author: byUsername.aliraza._id,
        name: byUsername.aliraza.name,
        username: byUsername.aliraza.username,
        initial: "A",
        content: "Learning JavaScript every day. Small steps lead to big results! #JavaScript #Learning",
        likes: [],
        comments: [{
          user: byUsername.saramalik._id,
          name: byUsername.saramalik.name,
          initial: "S",
          text: "Keep going! Great work."
        }],
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        author: byUsername.saramalik._id,
        name: byUsername.saramalik.name,
        username: byUsername.saramalik.username,
        initial: "S",
        content: "Welcome everyone! Excited to connect and share new ideas with this community. #Learning",
        likes: [byUsername.umarzia._id],
        comments: [
          { user: byUsername.aliraza._id, name: byUsername.aliraza.name, initial: "A", text: "Looking forward to it!" },
          { user: byUsername.ayeshakhan._id, name: byUsername.ayeshakhan.name, initial: "A", text: "Welcome to Socially!" }
        ],
        createdAt: new Date(Date.now() - 7200000)
      }
    ]);
  }

  console.log("Demo users are ready. Starter posts added only if the posts collection was empty.");
}

module.exports = { seedDemoData };
