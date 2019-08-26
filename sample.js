let insta = new require("./insta").instance({ }); 


insta.getUsername({identifier: "26669533"})
.then(data => {
    console.log(data); //Threat the data
    insta.getUser({identifier: data})
        .then(data => {
            console.log(data); //Threat the data
        })
})

// insta.getUserFollowers({identifier: "26669533", limit: 10})
//     .then(data => {
//         console.log(data); //Threat the data
//     })

// insta.getUserPosts({identifier: "26669533", limit: 10})
//     .then(data => {
//         console.log(data); //Threat the data
//     })

// insta.getPostDetails({identifier: "SQotORh6Gz"})
//     .then(data => {
//         console.log(data); //Threat the data
//     })

// insta.getPostLikes({identifier: "SQotORh6Gz", limit: 80})
//     .then(data => {
//         console.log(data); //Threat the data
//     })
