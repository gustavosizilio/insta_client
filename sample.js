let insta = new require("./insta").instance(); 


// insta.getPostLikes({identifier: "SQotORh6Gz", limit: 80}) //Pass the id of the post
//     .then(data => {
//         console.log(data); //Threat the data
//     })

insta.getUserPosts({identifier: "26669533"}) //Pass the id of the post
    .then(data => {
        console.log(data.length); //Threat the data
    })