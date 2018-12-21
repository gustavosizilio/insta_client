let insta = new require("./insta").instance(); 

insta.getPostLikes({post: "SQotORh6Gz", limit: 1}) //Pass the id of the post
    .then(data => {
        // console.log(data); //Threat the data
        console.log(data.length); //Threat the data
    })

// insta.getAllPostLikes({post: "BrA7vWYHIsF"}) //Pass the id of the post
//     .then(data => {
//         console.log(data); //Threat the data
//     })

// insta.getPostLikes({user: "26669533"}) //Pass the id of the post
//     .then(data => {
//         console.log(data); //Threat the data
//     })