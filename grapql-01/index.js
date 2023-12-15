import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { events, locations, participants, users } from './data.js';

const typeDefs = `

type User {
    id: ID!
    username: String!,
    email:String!,
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