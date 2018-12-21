let axios = require("axios");
let md5 = require('md5');

var insta = new function () {
    this.rhxGis = null;
    this.rootURL = 'https://www.instagram.com/';
    this.queryURL = 'https://www.instagram.com/graphql/query/';

    this.query = {
        getPostLikes : "e0f59e4a1c8d78d0161873bc2ee7ec44",
        defaultPageSize: 50
    }

    this.generateRequestSignature = function (queryVariables) {
        return this.getRhxGis().then((rhxGis) => {
            return md5(`${rhxGis}:${JSON.stringify(queryVariables)}`);
        })
    };

    //Used if the client can store the token
    this.instance = function(rhxGis){
        this.setRhxGis(rhxGis);
        return this;
    }


    this.setRhxGis = function(rhxGis) {
        this.rhxGis = rhxGis; 
    }

    this.getRhxGis = function() {
        if(this.rhxGis){
            return new Promise((resolve, reject) => {
                resolve(this.rhxGis);
            })
        } else {
            return axios.get(this.rootURL,
                {
                    "headers": {
                        'credentials': 'include',
                        'user-agent': "Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36",
                    }
                }
            ).then(r => {
                let resposeText = r.data;
                this.setRhxGis((RegExp('"rhx_gis":"([a-f0-9]{32})"', 'g')).exec(resposeText)[1]);
                // const csrftoken = (RegExp('"csrf_token":"([a-zA-Z0-9]{32})"', 'g')).exec(resposeText)[1];
                return this.rhxGis;
            });
        }
    }

    this.makeRequest = function({ queryHash, queryVariables }) {
        return this.generateRequestSignature(queryVariables)
        .then(signature => {
            return axios.get(
                `${this.queryURL}?query_hash=${queryHash}&variables=${JSON.stringify(queryVariables)}`,
                {
                    "headers": {
                        'user-agent': "Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36",
                        'x-instagram-gis': `${signature}`
                    },
                })
        });
    }

    this.buildPagination = function({queryVariables, limit, end_cursor, data = []}){
        let pagesize = this.query.defaultPageSize;
        let remaining = limit - data.length;
        if (remaining <= pagesize) {
            pagesize = remaining;
        }
        queryVariables.first = pagesize;
        if (end_cursor) {
            queryVariables.after = end_cursor;
        }
        return {remaining, pagesize}
    }


    this.getPostLikes = function({ post, limit, end_cursor, data = [] }) {
        let queryHash = this.query.getPostLikes;
        let queryVariables = { "shortcode": post, "include_reel": true };
        let pagination = this.buildPagination({
            queryVariables, limit, end_cursor, data
        });        

        return this.makeRequest({ queryHash, queryVariables }).then(res => {
            if (res.data.data.shortcode_media && res.data.data.shortcode_media.edge_liked_by && res.data.data.shortcode_media.edge_liked_by.edges) {
                data = data.concat(res.data.data.shortcode_media.edge_liked_by.edges);
                if (
                    res.data.data.shortcode_media.edge_liked_by.page_info.has_next_page &&
                    pagination.remaining > pagination.pagesize
                ) {
                    return this.getPostLikes({
                        post: post,
                        limit: limit,
                        end_cursor: res.data.data.shortcode_media.edge_liked_by.page_info.end_cursor,
                        data: data
                    })
                } else {
                    return data;
                }
            } else {
                return data;
            }
        })
    }
















    // getUserPosts = function getUserPosts({ user, end_cursor, data }) {
    //     if (!data) {
    //         data = [];
    //     }
    //     let queryVariables = { "id": user, "first": 50 };
    //     if (end_cursor) {
    //         queryVariables.after = end_cursor;
    //     }
    //     const queryHash = "66eb9403e44cc12e5b5ecda48b667d41"; //WHat to query?  

    //     return makeRequest({ queryHash, queryVariables }).then(res => {
    //         console.log(res.data.data);
    //         // if(res.data.data.shortcode_media && res.data.data.shortcode_media.edge_liked_by && res.data.data.shortcode_media.edge_liked_by.edges) {
    //         //     data = data.concat(res.data.data.shortcode_media.edge_liked_by.edges);
    //         //     if(res.data.data.shortcode_media.edge_liked_by.page_info.has_next_page){
    //         //         return getUserPosts({
    //         //             user: user,
    //         //             end_cursor: res.data.data.shortcode_media.edge_liked_by.page_info.end_cursor,
    //         //             data: data
    //         //         })
    //         //     } else {
    //         //         return data;
    //         //     }
    //         // } else {
    //         //     return data;
    //         // }
    //     })
    // }

}

module.exports = insta;