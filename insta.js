let axios = require("axios");
let md5 = require('md5');

/*
** Calculate the value of the X-Instagram-GIS header by md5 hashing together the rhx_gis variable and the query variables for the request.
*/
generateRequestSignature = function (rhxGis, queryVariables) {
    return md5(`${rhxGis}:${queryVariables}`);
};

module.exports.getPostLikes = function getPostLikes({post, end_cursor, data}) {
    if(!data) {
        data = [];
    }
    return axios.get('https://www.instagram.com/',
     { 
         "headers":{ 
             'credentials': 'include',
             'user-agent': "Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36",
         }
     }
    ).then(r => {

        let resposeText = r.data;
        const rhxGis = (RegExp('"rhx_gis":"([a-f0-9]{32})"', 'g')).exec(resposeText)[1];
        const csrftoken = (RegExp('"csrf_token":"([a-zA-Z0-9]{32})"', 'g')).exec(resposeText)[1];
        
        //QUERY MUST BE ENCODED!
        // const queryVariables = JSON.stringify({"shortcode":"BrA7vWYHIsF","include_reel":true,"first":12,"after":"QVFCRlNCNnFNT28zT3ZTV2EtNXo3MjhfazZTT1oyX3AtdjQwdUlBc053aG9JUU9lOEhpZWYwT2JjNDRJWlpFSklJTFBjMWtZci1fTW1QdFRBNnR2WmFYTw=="});
        let queryObj = {"shortcode":post,"include_reel":true,"first":50};
        if(end_cursor){
            queryObj.after = end_cursor;
        }
        const queryVariables = JSON.stringify(queryObj);
        const queryHash = "e0f59e4a1c8d78d0161873bc2ee7ec44"; //WHat to query?  
        const signature = generateRequestSignature(rhxGis, queryVariables);
        
        console.log(`https://www.instagram.com/graphql/query/?query_hash=${queryHash}&variables=${queryVariables}`);
        return axios.get(
            `https://www.instagram.com/graphql/query/?query_hash=${queryHash}&variables=${queryVariables}`,
            {   
                "headers":{
                    'user-agent': "Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36",
                    'x-instagram-gis': `${signature}`
                },
        }).then(res => {
            if(res.data.data.shortcode_media && res.data.data.shortcode_media.edge_liked_by && res.data.data.shortcode_media.edge_liked_by.edges) {
                data = data.concat(res.data.data.shortcode_media.edge_liked_by.edges);
                if(res.data.data.shortcode_media.edge_liked_by.page_info.has_next_page){
                    return getPostLikes({
                        post: post,
                        end_cursor: res.data.data.shortcode_media.edge_liked_by.page_info.end_cursor,
                        data: data
                    })
                } else {
                    return data;
                }
            } else {
                return data;
            }
        }).catch(err => {
            console.log(err.message);
        })
    });
}
