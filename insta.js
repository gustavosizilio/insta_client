let axios = require("axios");
let md5 = require('md5');
let _ = require('lodash');

var insta = new function () {
    this.rhxGis = null;
    this.rootURL = 'https://www.instagram.com/';
    this.queryURL = 'https://www.instagram.com/graphql/query/';

    this.query = {
        getPostLikes: "e0f59e4a1c8d78d0161873bc2ee7ec44",
        getUserPosts: "66eb9403e44cc12e5b5ecda48b667d41",
        defaultPageSize: 50
    }

    this.generateRequestSignature = function (queryVariables) {
        return this.getRhxGis().then((rhxGis) => {
            return md5(`${rhxGis}:${JSON.stringify(queryVariables)}`);
        })
    };

    //Used if the client can store the token
    this.instance = function (rhxGis) {
        this.setRhxGis(rhxGis);
        return this;
    }


    this.setRhxGis = function (rhxGis) {
        this.rhxGis = rhxGis;
    }

    this.getRhxGis = function () {
        if (this.rhxGis) {
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

    this.makeRequest = function ({ queryHash, queryVariables }) {
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

    this.buildPagination = function ({ queryVariables, limit, end_cursor, data = [] }) {
        let pagesize = this.query.defaultPageSize;
        let remaining;
        let hasLimit = false;
        if(limit){
           hasLimit = true;
           remaining = limit - data.length;
           if (remaining <= pagesize) {
               pagesize = remaining;
           }
        }
        
        queryVariables.first = pagesize;
        if (end_cursor) {
            queryVariables.after = end_cursor;
        }
        
        return { hasLimit, remaining, pagesize }
    }

    this.defaultQuery = function ({ 
        queryHash,
        queryVariables,
        edjeKey,
        limit,
        end_cursor,
        data = []
    }) {

        let pagination = this.buildPagination({
            queryVariables, limit, end_cursor, data
        });
        
        return this.makeRequest({ queryHash, queryVariables }).then(res => {
            let edge = _.get(res, edjeKey);
            if (edge) {
                data = data.concat(edge.edges);
                if (
                    edge.page_info.has_next_page &&
                    (!pagination.hasLimit || pagination.remaining > pagination.pagesize)
                ) {
                    return this.defaultQuery({
                        queryHash,
                        queryVariables,
                        edjeKey,
                        limit: limit,
                        end_cursor: edge.page_info.end_cursor,
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

    /**
     * 
     * 
     * 
     * 
     * QUERY FUNCTIONS
     * 
     * 
     * 
     *
     */

    this.getPostLikes = function ({ identifier, limit, end_cursor, data = [] }) {
        return this.defaultQuery({
            queryHash: this.query.getPostLikes,
            queryVariables: { "shortcode": identifier, "include_reel": true },
            edjeKey: 'data.data.shortcode_media.edge_liked_by',
            limit,
            end_cursor,
            data
        })
    }

    this.getUserPosts = function ({ identifier, limit, end_cursor, data = [] }) {
        return this.defaultQuery({
            queryHash: this.query.getUserPosts,
            queryVariables: { "id": identifier },
            edjeKey: 'data.data.user.edge_owner_to_timeline_media',
            limit,
            end_cursor,
            data
        })
    }

}

module.exports = insta;