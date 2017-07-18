import { ApolloClient, createNetworkInterface } from 'apollo-client';
import '../lib/angular1-apollo-master';
import gql from 'graphql-tag';
(function() {
    'use strict';
    angular.module('rql.io', [
            'angular-apollo'
        ])
        .constant('APIKEY', { user: "newUser", project: "one" })
        .service('$rql',['apollo','$http','APIKEY', function(apollo, $http, APIKEY) {
            return{ 
                                read: function(ql) {
                    APIKEY = init(APIKEY);
                    var query = parseQuery(ql);
                    if (query) {
                        var networkInterface = createNetworkInterface({
                            uri: "http://66.70.189.237/" + APIKEY.user + "/" + APIKEY.project + "/" + APIKEY.role + "/prod"
                        })

                        const client = new ApolloClient({
                            networkInterface
                        });
                        apollo.defaultClient(client);
                        return apollo.query({
                                query: gql(query)
                            })
                            .then(result => {
                                return (result);
                            })
                            .catch(error => {
                                return error
                            });
                    } else {
                        return "Query/Token not available";
                    }
                }, 
                create: function(ql) {
                    APIKEY = init(APIKEY);
                    var query = parseCreateMutation(ql)
                    var headers = getHeaders(ql);
                    return mutation(query, headers);
                },
                update: function(ql) {
                    APIKEY = init(APIKEY);
                    var headers = getHeaders(ql);
                    var query = parseupdateMutation(ql.query)
                    return mutation(query, headers);
                },
                delete: function(ql) {
                    APIKEY = init(APIKEY);
                    var headers = getHeaders(ql);
                    var query = parsedeleteMutation(ql)
                    return mutation(query, headers);
                },
            }
          
            function init(apikey) {
                APIKEY.role = APIKEY.role ? APIKEY.role : 'guest'
                return APIKEY;
            }

            function mutation(ql, headers) {
                //console.log(ql.mutation);
                if (ql) {
                    var networkInterface = createNetworkInterface({
                        uri: "http://66.70.189.237/" + APIKEY.user + "/" + APIKEY.project + "/" + APIKEY.role + "/prod?" + headers
                    })

                    const client = new ApolloClient({
                        networkInterface
                    });
                    apollo.client = client;
                    return apollo.mutate({
                            mutation: gql(ql.mutation)
                        })
                        .then(result => {
                            return (result);
                        })
                        .catch(error => {
                            return error
                        });
                } else {
                    console.log("missing params");
                    return "Mutation/Token is missing";
                }
            }

            function parseQuery(t) {
                var n = "query{\n";
                for (var o in t) n += o, n = a(t[o], n);
                return n = n.substring(0, n.length - 1), n += "\n}"
            }

            function a(t, n) {
                return n = b(t, n), c(t, n)
            }

            function b(t, n) {
                for (var o = "", i = t.length, u = 0; i > u; u++)
                    if ("object" == typeof t[u] && "object" != typeof t[u][Object.keys(t[u])[0]])
                        for (var a in t[u]) o += "" == o ? "string" == typeof t[u][a] ? a + ':"' + t[u][a] + '"' : a + ":" + t[u][a] : "string" == typeof t[u][a] ? "," + a + ':"' + t[u][a] + '"' : "," + a + ":" + t[u][a];
                return "" !== o && (n += "(" + o + ")"), n
            }
            
            function c(t, n) {
                n += "{\n";
                for (var o = t.length, i = 0; o > i; i++)
                    if ("object" == typeof t[i]) {
                        if ("object" == typeof t[i][Object.keys(t[i])[0]]) {
                            n += Object.keys(t[i])[0], n = a(t[i][Object.keys(t[i])[0]], n);
                            var n = n.substring(0, n.length - 1);
                            n += "\n"
                        }
                    } else n += t[i] + "\n";
                var n = n.substring(0, n.length - 1);
                return n += "\n} "
            }

            function parseCreateMutation(t) {
                var n = { mutation: "mutation{\n", _roles: {} };
                for (var o in t) n.mutation += o + ":add" + o, n = am(o, t[o], n);
                return n.mutation = n.mutation.substring(0, n.mutation.length - 1), n.mutation += "\n{_id}}", n
            }

            function am(t, n, o) {
                o.mutation += "(";
                for (var i in n) "object" == typeof n[i] ? "_roles" == i ? o._roles[t] = n[i] : (o.mutation += i + ":", o = bm(i, n[i], o), o.mutation = o.mutation.substring(0, o.mutation.length - 1), o.mutation += ",") : (o.mutation += i + ":", o.mutation += "string" == typeof n[i] ? '"' + n[i] + '",\n' : n[i] + ",\n");
                return o.mutation = o.mutation.substring(0, o.mutation.length - 2), o.mutation += "),", o
            }

            function bm(t, n, o) {
                o.mutation += "{";
                for (var i in n) "object" == typeof n[i] ? "_roles" == i ? o._roles[t] = n[i] : (o.mutation += i + ":", o = b(i, n[i], o), o.mutation = o.mutation.substring(0, o.mutation.length - 1), o.mutation += ",") : "string" == typeof n[i] ? (o.mutation += i + ":", o.mutation += '"' + n[i] + '",\n') : (o.mutation += i + ":", o.mutation += n[i] + ",\n");
                return o.mutation = o.mutation.substring(0, o.mutation.length - 2), o.mutation += "},", o
            }

            function parsedeleteMutation(t) {
                var n = { mutation: "mutation{\n", _roles: {} };
                for (var o in t) n.mutation += o + ":del" + o, n = ad(o, t[o], n);
                return n.mutation = n.mutation.substring(0, n.mutation.length - 1), n.mutation += "\n{_id}}", n
            }

            function ad(t, n, o) {
                o.mutation += "(";
                for (var i in n) "object" == typeof n[i] ? "_roles" == i ? o._roles[t] = n[i] : (o.mutation += i + ":", o = bd(i, n[i], o), o.mutation = o.mutation.substring(0, o.mutation.length - 1), o.mutation += ",") : (o.mutation += i + ":", o.mutation += n[i] + ",\n");
                return o.mutation = o.mutation.substring(0, o.mutation.length - 2), o.mutation += "),", o
            }

            function bd(t, n, o) {
                o.mutation += "{";
                for (var i in n) "object" == typeof n[i] ? "_roles" == i ? o._roles[t] = n[i] : (o.mutation += i + ":", o = bd(i, n[i], o), o.mutation = o.mutation.substring(0, o.mutation.length - 1), o.mutation += ",") : (o.mutation += i + ":", o.mutation += n[i] + ",\n");
                return o.mutation = o.mutation.substring(0, o.mutation.length - 2), o.mutation += "},", o
            }

            function parseupdateMutation(t) {
                var n = { mutation: "mutation{\n", _roles: {} };
                for (var o in t) n.mutation += o + ":update" + o, n = au(o, t[o], n);
                return n.mutation = n.mutation.substring(0, n.mutation.length - 1), n.mutation += "\n{_id}}", n
            }

            function au(t, n, o) {
                o.mutation += "(";
                for (var i in n) "object" == typeof n[i] ? "_roles" == i ? o._roles[t] = n[i] : (o.mutation += i + ":", o = bu(i, n[i], o), o.mutation = o.mutation.substring(0, o.mutation.length - 1), o.mutation += ",") : (o.mutation += i + ":", o.mutation += n[i] + ",\n");
                return o.mutation = o.mutation.substring(0, o.mutation.length - 2), o.mutation += "),", o
            }

            function bu(t, n, o) {
                o.mutation += "{";
                for (var i in n) "object" == typeof n[i] ? "_roles" == i ? o._roles[t] = n[i] : (o.mutation += i + ":", o = bu(i, n[i], o), o.mutation = o.mutation.substring(0, o.mutation.length - 1), o.mutation += ",") : (o.mutation += i + ":", o.mutation += n[i] + ",\n");
                return o.mutation = o.mutation.substring(0, o.mutation.length - 2), o.mutation += "},", o
            }

            function getHeaders(ql) {
                if (ql) {
                    // ql = JSON.parse(ql);
                    var entity = Object.keys(ql);
                    var text;
                    if (ql[entity[0]]._roles) {
                        text = entity[0] + '=' + JSON.stringify(ql[entity[0]]._roles);
                    } else {
                        text = "";
                    }
                    //console.log(text);
                    return text;
                } else {
                    return null;
                }
            }
        }]);

})();
