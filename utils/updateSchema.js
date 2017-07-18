module.exports = {
    updateSchema: function updateSchema(e, t) {
        function n(e) {
            for (var t = e.definitions.length, n = 0; t > n; n++) "mutation" == e.definitions[n].operation && r(e.definitions[n].selectionSet.selections)
        }

        function r(e) {
            for (var n = e.length, r = 0; n > r; r++) {
                var i = e[r].name.value.substring(3);
                t.entities[i] || (t.entities[i] = []);
                var o = e[r].arguments;
                if (a(o, i), e[r].selectionSet) {
                    var l = e[r].selectionSet.selections;
                    m(l, i)
                }
            }
        }

        function a(e, n) {
            for (var r = e.length, m = 0; r > m; m++)
                if (void 0 !== e[m].value.value) {
                    if (o(t.entities[n], e[m].name.value)) {
                        var l = e[m].value.kind;
                        l = l.substring(0, l.length - 5);
                        var v = { name: e[m].name.value, type: l, "null": !1 };
                        t.entities[n].push(v)
                    }
                } else if (t.otm[n] ? i(t.otm[n], e[m].name.value) && t.otm[n].push(e[m].name.value) : t.otm[n] = [e[m].name.value], void 0 !== e[m].value.fields) {
                var s = e[m].name.value;
                t.entities[s] || (t.entities[s] = []);
                var u = e[m].value.fields;
                a(u, s)
            }
        }

        function i(e, t) {
            arrl = e.length;
            for (var n = !0, r = 0; arrl > r; r++) e[r] == t && (n = !1);
            return n
        }

        function o(e, t) {
            arrl = e.length;
            for (var n = !0, r = 0; arrl > r; r++) e[r].name == t && (n = !1);
            return n
        }

        function m(e) {
            for (var t = e.length, n = 0; t > n; n++)
                if (e[n].selectionSet) {
                    console.log(e[n].name.value);
                    var r = e[n].name.value,
                        a = e[n].selectionSet.selections;
                    m(a, r)
                } else console.log(e[n].name.value)
        }

        function l(e) {
            for (var t in e.otm)
                for (var n in e.otm)
                    for (var r = e.otm[n].length, a = 0; r > a; a++)
                        if (t == e.otm[n][a])
                            for (var i = e.otm[t].length, o = 0; i > o; o++) n == e.otm[t][o] && (e.mtm[t] ? e.mtm[t].push(n) : e.mtm[t] = [n]);
            return e
        }

        function v(e) {
            for (var t in e.mtm)
                for (var n = e.mtm[t].length, r = 0; n > r; r++)
                    for (var a = e.otm[t].length, i = 0; a > i; i++) e.mtm[t][r] == e.otm[t][i] && e.otm[t].splice(i, 1);
            for (var o in e.otm) 0 == e.otm[o].length && delete e.otm[o];
            return e
        }

        function s(e) {
            var t = !0;
            e.mtm_pairs=[];
            for (var n in e.mtm) {
                var r = e.mtm[n].length;
                if (t) {
                    for (var a = 0; r > a; a++) {
                        var i = n,
                            o = e.mtm[n][a];
                        e.mtm_pairs.push([i, o])
                    }
                    t = !1
                } else
                    for (var a = 0; r > a; a++) {
                        for (var i = n, o = e.mtm[n][a], m = e.mtm_pairs.length, l = !0, v = 0; m > v; v++) {
                            var s = e.mtm_pairs[v][0],
                                u = e.mtm_pairs[v][1];
                            i == u & o == s && (l = !1)
                        }
                        l && e.mtm_pairs.push([i, o])
                    }
            }
            return e
        }
        return n(e), t = l(t), t = v(t), t = s(t)
    }
}
