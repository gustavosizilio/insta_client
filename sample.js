// let insta = new require("./insta").instance({ httpsProxyUrl: 'http://185.61.92.207:34364' }); 
let insta = new require("./insta").instance({ proxy: 'http://67.209.116.227:24001/', timeout: 150000, retry: 5 }); 


// insta.getUsername({identifier: "26669533"})
// .then(data => {
//     console.log(data); //Threat the data
// })

// insta.getUserProfile({identifier: 'neymarjr'})
//     .then(data => {
//         console.log(data); //Threat the data
//     })

// insta.getUserFollowers({identifier: "26669533", limit: 10})
//     .then(data => {
//         console.log(data); //Threat the data
//     })

insta.getUserPosts({identifier: "26669533", limit: 300})
    .then(data => {
        console.log(JSON.stringify(data)); //Threat the data
    })

// insta.getPostDetails({identifier: "B2gxtu-o3Oc"})
//     .then(data => {
//         console.log(data); //Threat the data
//     })

// insta.getPostLikes({identifier: "SQotORh6Gz", limit: 80})
//     .then(data => {
//         console.log(data); //Threat the data
//     })
