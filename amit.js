const SocialPost = require("social-post-api");
const API_KEY = "RMG9FNY-3QF443H-NY3JNW8-QNGXT7J"; 
const social = new SocialPost(API_KEY);

const run = async () => {
  /** post */
  const post = await social.post({
    post: "Who you gonna call?",
    platforms: ["linkedin"],
    // platforms: ["twitter", "facebook", "fbg", "instagram", "linkedin", "gmb"],
    mediaUrls: ["https://img.ayrshare.com/012/gb.jpg"]
  }).catch(console.error);
  console.log(post);

  /** history */
//   const history = await social.history()
//      .catch(console.error);
//   console.log(history);

//   /** delete */
//   const deletePost = await social.delete({ id: post.id })
//      .catch(console.error);
//   console.log(deletePost);
};

run();




// const SocialPost = require("social-post-api");
// const API_KEY = "RMG9FNY-3QF443H-NY3JNW8-QNGXT7J"; 
// const social = new SocialPost(API_KEY);

// const run = async () => {
//   /** schedule post */
//   const scheduledPost = await social.schedule({
//     post: "Who you gonna call?",
//     platforms: ["linkedin"],
//     // platforms: ["twitter", "facebook", "fbg", "instagram", "linkedin", "gmb"],
//     mediaUrls: ["https://img.ayrshare.com/012/gb.jpg"],
//     scheduleDate: new Date("2024-01-24T12:00:00.000Z") // Replace this with your desired schedule date and time
//   }).catch(console.error);
//   console.log(scheduledPost);

//   /** history */
//   // const history = await social.history()
//   //    .catch(console.error);
//   // console.log(history);

//   // /** delete */
//   // const deletePost = await social.delete({ id: scheduledPost.id })
//   //    .catch(console.error);
//   // console.log(deletePost);
// };

// run();
