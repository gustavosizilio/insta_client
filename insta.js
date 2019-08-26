const fetch = require('node-fetch');
let md5 = require('md5');
let _ = require('lodash');


var insta = new function () {
    //USING HTTP BECAUSE OF THE PROXY!!!! TEST STRESSING IF NEED CHANGE TO HTTPS ON THE FUTURE
    this.rootURL = 'http://www.instagram.com/';
    this.graphqlURL = 'http://www.instagram.com/graphql/query/';
    this.topSearchURL = "http://www.instagram.com/web/search/topsearch/"

    this.query = {
        getPostLikes: "e0f59e4a1c8d78d0161873bc2ee7ec44",
        getUserPosts: "66eb9403e44cc12e5b5ecda48b667d41",
        getUserFollowers: "c76146de99bb02f6415203be841dd25a",
        getPostDetails: "49699cdb479dd5664863d4b647ada1f7",
        defaultPageSize: 50
    }

    this.instance = function () {
        return this;
    }

    this.makeRequest = function ({ queryHash, queryVariables }) {
        return fetch(`${this.graphqlURL}?query_hash=${queryHash}&variables=${JSON.stringify(queryVariables)}`,
        {
            method: 'get',
            headers: { 
                'Content-Type': 'application/json',
                'user-agent': "Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36"
            },
        })
        .then(res => res.json())
        .then(json => { return json });
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
        singleResult,
        edgeKey,
        limit,
        end_cursor,
        data = []
    }) {

        let pagination = this.buildPagination({
            queryVariables, limit, end_cursor, data
        });
        
        return this.makeRequest({ queryHash, queryVariables }).then(res => {
            let edge = _.get(res, `${edgeKey}`);
            if(singleResult){
                return edge;
            }
            if (edge) {
                data = data.concat(edge.edges);
                if (
                    edge.page_info.has_next_page &&
                    (!pagination.hasLimit || pagination.remaining > pagination.pagesize)
                ) {
                    return this.defaultQuery({
                        queryHash,
                        queryVariables,
                        edgeKey,
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

    this.getUser = function ({ identifier }) {
        return fetch(`${this.topSearchURL}?query=${identifier}`,
        {
            method: 'get',
            headers: { 
                'Content-Type': 'application/json',
                'user-agent': "Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36"
            },
        })
        .then(res => res.json())
        .then(res => {
            return new Promise((resolve, reject) => {
                res.data.users.forEach(data => {
                    if(data.user.username == identifier){
                        resolve(data.user);
                    }
                });
                resolve(null);
            })
        })
    }

    this.getPostLikes = function ({ identifier, limit, end_cursor, data = [] }) {
        return this.defaultQuery({
            queryHash: this.query.getPostLikes,
            queryVariables: { "shortcode": identifier, "include_reel": true },
            edgeKey: 'data.shortcode_media.edge_liked_by',
            limit,
            end_cursor,
            data
        })
    }

    this.getUserPosts = function ({ identifier, limit, end_cursor, data = [] }) {
        return this.defaultQuery({
            queryHash: this.query.getUserPosts,
            queryVariables: { "id": identifier },
            edgeKey: 'data.user.edge_owner_to_timeline_media',
            limit,
            end_cursor,
            data
        })
    }

    this.getUserFollowers = function ({ identifier, limit, end_cursor, data = [] }) {
        return this.defaultQuery({
            queryHash: this.query.getUserFollowers,
            queryVariables: { "id": identifier, "first": limit },
            edgeKey: 'data.user.edge_followed_by',
            singleResult: true,
            limit,
            end_cursor,
            data
        })
    }

    this.getPostDetails = function ({ identifier, limit, end_cursor, data = [] }) {
        return this.defaultQuery({
            queryHash: this.query.getPostDetails,
            queryVariables:  { "shortcode":identifier },
            edgeKey: 'data.shortcode_media',
            singleResult: true,
            limit,
            end_cursor,
            data
        })
    }

}

module.exports = insta;