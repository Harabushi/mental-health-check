const { AuthenticationError } = require('apollo-server-express');
const { User, QuizSet, QuizResult } = require('../models');
const Recording = require('../models/Recording');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        // user should return each quizSet with it's results
        user: async (parent, args, context) => {
            if (context.user) {
                const user = await User.findById({ _id: context.user._id })
                    .populate('quizzes')
                return user;
            }

            throw new AuthenticationError('Not logged in');
        },
        quizSet: async (parent, { quizSetId }, context) => {
            if (context.user) {
                const quizSet = await QuizSet.findById(
                    { _id: quizSetId }
                )
                return quizSet
            }
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        updateUser: async (parent, args, context) => {
            if (context.user) {
                return await User.findByIdAndUpdate(context.user._id, args, { new: true });
            }

            throw new AuthenticationError('Not logged in');
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);

            return { token, user };
        },
        // creates a single quiz set
        addQuizSet: async (parent, args, context) => {
            if (context.user) {
                // creates a single quiz
                const quizSet = await QuizSet.create({
                    // null uses context
                    args
                });
                // add quizSet to user
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { quizzes: quizSet } },
                    { new: true }

                )
                return quizSet
            }

            throw new AuthenticationError('Not logged in');
        },
        // creates new record for quiz taken
        addQuizResult: async (parent, { quizSetId, quizTaken, quizAnswer }, context) => {
            if (context.user) {
                // create new quiz result
                const updatedQuizSet = await QuizSet.findOneAndUpdate(
                    { _id: quizSetId },
                    { $push: { quizResults: { quizTaken, quizAnswer } } },
                    { new: true }
                );
                return updatedQuizSet;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        // delete a QuizSet
        removeQuizSet: async (parent, { quizSetId }, context) => {
            if (context.user) {
                const deletedQuizSet = await QuizSet.findByIdAndDelete(
                    { _id: quizSetId },
                )
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { quizzes: deletedQuizSet } }
                )
                return deletedQuizSet;
            }

            throw new AuthenticationError('You need to be logged in!');

        },
        addRecording: async (parent, { audio, title }, context) => {
            if (context.user) {
                const newRecording = await Recording.create({
                    audio,
                    title
                })

                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { recordings: newRecording } }
                )


                return newRecording
            }
            throw new AuthenticationError('You need to be logged in!');

        },
        // delete a Recording
        removeRecording: async (parent, { recordingId }, context) => {
            if (context.user) {
                const deletedRecording = await Recording.findByIdAndDelete(
                    { _id: recordingId },
                )
                // console.log(recordingId)
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { recordings: deletedRecording } }
                )
                return deletedRecording;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    }
}

module.exports = resolvers;
