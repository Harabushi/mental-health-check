const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        _id: ID
        username: String
        email: String
        quizzes: [QuizSet]
    }

    type Auth {
        token: ID!
        user: User
    }

    type QuizSet {
        _id: ID
        quizResults: [QuizResult]
    }

    type QuizResult {
        _id: ID
        quizSetId: ID
        quizTaken: String
        quizAnswer: String
    }

    type Recording {
        _id: ID
        audio: String
        title: String

    }

    type Query {
        user: User
        quizSet(quizSetId: String): QuizSet
    }

    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        updateUser(username: String, email: String, password: String): User
        addQuizSet(_id: ID, quizResults: String ): QuizSet
        addQuizResult(quizSetId: ID, quizTaken: String!, quizAnswer: String!): QuizSet
        removeQuizSet(quizSetId: ID): QuizSet
        addRecording(audio: String!, title: String!): Recording
        removeRecording(recordingId: ID): Recording
    }
`
//todo mutation

module.exports = typeDefs;

