let insta = new require("./insta").instance({ 
    // proxy: {
    //     host: '127.0.0.1',
    //     port: 8118
    // }
}); 

// insta.getUser({identifier: "gustavo.sizilio"})
//     .then(data => {
//         console.log(data); //Threat the data
//     })

// insta.getUserFollowers({identifier: "26669533", limit: 10})
//     .then(data => {
//         console.log(data); //Threat the data
//     })

// insta.getUserPosts({identifier: "26669533", limit: 10})
//     .then(data => {
//         console.log(data); //Threat the data
//     })

insta.getProfilePic({identifier: "26669533", limit: 10})
    .then(data => {
        console.log(data); //Threat the data
    })

// insta.getPostDetails({identifier: "SQotORh6Gz"})
//     .then(data => {
//         console.log(data); //Threat the data
//     })

// insta.getPostLikes({identifier: "SQotORh6Gz", limit: 80})
//     .then(data => {
//         console.log(data); //Threat the data
//     })
