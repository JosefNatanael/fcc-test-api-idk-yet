/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

module.exports = function (app) {

    app.route('/api/threads/:board')
        .get((req, res) => {
            let currBoard = req.params.board;

            MongoClient.connect(MONGODB_CONNECTION_STRING, function (err, db) {
                db.collection(currBoard).find()
                    .sort({ bumped_on: -1 })
                    .limit(10)
                    .toArray(
                        (err, doc) => {
                            let response = doc.map(i => {
                                let replies = i.replies.filter((a, b) => b > i.replies.length - (3 + 1)).map(a => {
                                    return {
                                        text: a.text,
                                        _id: a._id,
                                        created_on: a.created_on
                                    }
                                })
                                return {
                                    _id: i._id,
                                    created_on: i.created_on,
                                    bumped_on: i.bumped_on,
                                    text: i.text,
                                    replies: replies,
                                    replyCount: replies.length
                                }
                            })
                            res.send(response)
                        })
            });
        })
        .post((req, res) => {
            let currBoard = req.params.board
            let now = new Date();
            let newThread = {
                text: req.body.text,
                created_on: now,
                bumped_on: now,
                reported: false,
                delete_password: req.body.delete_password,
                replies: []
            }
            MongoClient.connect(MONGODB_CONNECTION_STRING, function (err, db) {
                db.collection(currBoard)
                    .insertOne(newThread, (err, data) => {
                        res.redirect('/b/' + currBoard)
                    })
            });

        })
        .put((req, res) => {
            let currBoard = req.params.board
            let id = req.body.thread_id

            MongoClient.connect(MONGODB_CONNECTION_STRING, function (err, db) {
                db.collection(currBoard).findAndModify(
                    { _id: ObjectId(id) },
                    {},
                    { $set: { reported: true } },
                    (err, data) => {
                        res.send('success')
                    });
            });
        })
        .delete((req, res) => {
            let currBoard = req.params.board
            let id = req.body.thread_id
            let password = req.body.delete_password
            MongoClient.connect(MONGODB_CONNECTION_STRING, function (err, db) {
                db.collection(currBoard).find({ _id: ObjectId(id) })
                    .toArray((err, result) => {
                        if (result.length < 0) {
                            res.send('Invalid id')
                        } else {
                            if (password == result[0].delete_password) {
                                db.collection(currBoard).remove({ _id: ObjectId(id) },
                                    (err, data) => {
                                        res.send('success')
                                    });
                            } else {
                                res.send('incorrect password')
                            }
                        }
                    });
            });
        });

    app.route('/api/replies/:board')
        .get((req, res) => {
            let currBoard = req.params.board
            let thread_id = req.query.thread_id

            MongoClient.connect(MONGODB_CONNECTION_STRING, function (err, db) {
                db.collection(currBoard).find({ _id: ObjectId(thread_id) })
                    .toArray(
                        (err, doc) => {
                            let response = doc.map(i => {
                                return {
                                    _id: i._id,
                                    created_on: i.created_on,
                                    bumped_on: i.bumped_on,
                                    text: i.text,
                                    replies: i.replies.map(j => {
                                        return {
                                            _id: j._id,
                                            text: j.text,
                                            created_on: j.created_on
                                        }
                                    })
                                }
                            })
                            return res.json(response[0])
                        })
            });
        })
        .post((req, res) => {
            let currBoard = req.params.board
            let now = new Date();
            let id = req.body.thread_id
            let newReply = {
                _id: ObjectId(),
                text: req.body.text,
                created_on: now,
                delete_password: req.body.delete_password,
                reported: false
            }
            MongoClient.connect(MONGODB_CONNECTION_STRING, function (err, db) {
                db.collection(currBoard).findAndModify(
                    { _id: ObjectId(id) },
                    {},
                    {
                        $push: { replies: newReply },
                        $set: { bumped_on: now }
                    },
                    (err, doc) => {
                        return res.redirect('/b/' + currBoard)
                    });
            });
        })
        .put((req, res) => {
            let currBoard = req.params.board
            let thread_id = req.body.thread_id
            let reply_id = req.body.reply_id

            MongoClient.connect(MONGODB_CONNECTION_STRING, function (err, db) {
                db.collection(currBoard).findAndModify(
                    {
                        _id: ObjectId(thread_id),
                        "replies": { $elemMatch: { _id: ObjectId(reply_id) } }
                    },
                    {},
                    { $set: { "replies.$.reported": true } },
                    (err, doc) => {
                        return res.send('success')
                    });
            });
        })
        .delete((req, res) => {
            let currBoard = req.params.board
            let password = req.body.delete_password
            let thread_id = req.body.thread_id
            let reply_id = req.body.reply_id
            MongoClient.connect(MONGODB_CONNECTION_STRING, function (err, db) {
                db.collection(currBoard)
                    .find({
                        _id: ObjectId(thread_id),
                        "replies": { $elemMatch: { _id: ObjectId(reply_id) } }
                    })
                    .toArray((err, data) => {
                        if (data.length < 0) {
                            return res.send('Invalid id')
                        } else {
                            let delete_password = data[0].replies.filter((x => x._id == reply_id))[0].delete_password
                            if (password == delete_password) {
                                db.collection('test').findAndModify(
                                    { _id: ObjectId(thread_id) },
                                    {},
                                    { $pull: { "replies": { _id: ObjectId(reply_id) } } },
                                    (err, doc) => {
                                        return res.send('success')
                                    });
                            } else {
                                return res.send('incorrect password')
                            }
                        }
                    });
            });
        });

}