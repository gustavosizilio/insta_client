let insta = require("./insta"); 

insta.getPostLikes({post: "BrA7vWYHIsF"}) //Pass the id of the post
    .then(data => {
        console.log(data); //Threat the data
    })