import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { events, locations, participants, users } from './data.js';
import { nanoid } from 'nanoid';

const typeDefs = `#graphql

  type User {
    id: ID!
    username: String!,
    email:String!,
  }

  input createUserInput{
    username:String!
    email:String!
  }

  input updateUserInput{
    username:String!
    email:String!
  }
  

  type Location{
    id:ID!,
    name:String!,
    desc:String,
    lat:Float,
    lng:Float
  }

  type Event {
     id: ID!,
     title: String,
     desc: String,
     date: String,
     from: String,
     to: String,
     location_id: ID!,
     user_id: ID!,
     user:[User!]!
     participants: [Participant!]!
     location: [Location!]!
  }
  
  type Participant {
     id: ID!,
     user_id: ID!,
     event_id: ID!
  }

 type allDeleted {
  count:Int
 }

  type Query {
      users: [User!]!
      user(id:ID!):User!

      events: [Event!]!
      event(id:ID!):Event!
      
      locations: [Location!]!
      location(id:ID!):Location!
      
      participants: [Participant!]!
      participant(id:ID!):Participant!
  }

  type Mutation {
    createUser(data:createUserInput): User
    updateUser(id:ID!,data:updateUserInput): User
    deletedUser(id:ID,username:String): User
    deletedAllUser:allDeleted
  }

`;

const resolvers = {
  Query: {
    //!events
    events: () => events,
    event: (parent, args) => events.find(event => event.id == args.id),

    //!User
    users: () => users,
    user: (parent, args) => users.find(user => user.id == args.id),
    //!locations
    locations: () => locations,
    location: (parent, args) => locations.find(location => location.id == args.id),
    //!participants
    participants: () => participants,
    participant: (parent, args) => participants.find(participant => participant.id == args.id),
  },

  Event: {
    user: (parent, args) => users.filter(user => user.id == parent.user_id),
    location: (parent, args) => locations.filter(location => location.id == parent.location_id),
    participants: (parent, args) => participants.filter(participant => participant.user_id == parent.user_id)
  },

  Mutation: {
    createUser: (parent, { data }) => {
      const user_input = { id: nanoid(), ...data };
      users.push(user_input);
      return user_input
    },
    updateUser: (parent, { id, data }) => {
      const uIndex = users.findIndex(user => user.id == id)
      uIndex === -1 && new Error("Not Found")
      return users[uIndex] = { ...users[uIndex], ...data }

    },
    deletedUser: (parent, { id, username }) => {
      const duIndex = users.findIndex(index => index.id == id || index.username == username)
      duIndex === -1 && new Error("not found")
      users.splice(duIndex, 1)
      return users[duIndex]
    },
    deletedAllUser: () => {
      const length = users.length
      users.splice(0, length)
      return { count: length }
    }

  }

};


const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);