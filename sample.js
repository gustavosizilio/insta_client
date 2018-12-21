let insta = new require("./insta").instance(); 

insta.getUser({identifier: "gustavo.sizilio"}) //Pass the id of the post
    .then(data => {
        console.log(data); //Threat the data
    })

insta.getUserPosts({identifier: "26669533"}) //Pass the id of the post
    .then(data => {
        console.log(data.length); //Threat the data
    })

insta.getPostDetails({identifier: "SQotORh6Gz"}) //Pass the id of the post
    .then(data => {
        console.log(data); //Threat the data
    })

insta.getPostLikes({identifier: "SQotORh6Gz", limit: 80}) //Pass the id of the post
    .then(data => {
        console.log(data); //Threat the data
    })
