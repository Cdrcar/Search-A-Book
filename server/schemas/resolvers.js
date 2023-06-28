// Define the query and mutation functionality to work with the Mongoose models
const { AuthenticationError } = require("apolo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
        me: async( parent, args, context ) => {
            if(context.user) {
                const userData = await User.findOne({ _id: context.user._id}).select(
                    "-__v -password"
                );

                return userData;
            }

            throw new AuthenticationError("Not logged in");
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError ("No user found with this email address")
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw) {
                throw new AuthenticationError("Incorrect credentials");
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { bookData }, context) => {
            if(context.user) {
                const updateUser = await User.findByIdAndUpdate(
                    { _id: context.user._id},
                    { $push: { savedBooks: bookData}},
                    { new: true }
                );
                return updateUser;
            }

            throw new AuthenticationError("You need to be logged in!");
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updateUser = await User.findOneAndUpdate(
                    { _id: context.user._id},
                    { $pul: { savedBooks: { bookId }} },
                    { new: true }
                );

                return updateUser;
            }

            throw new AuthenticationError("You need to be logged in!");        
        }
    }
};

module.exports = resolvers;