import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { events, locations, participants, users } from './data.js';
import { nanoid } from 'nanoid';

const typeDefs = `#graphql

  #USER
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
  
  #Location
  type Location{
    id:ID!,
    name:String!,
    desc:String,
    lat:Float,
    lng:Float
  }

  input createLocationInput{
    name:String!
    desc:String
  }

  input updateLocationInput{
    name:String
    desc:String
  }

  #Event

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

  input createEventInput{
    title:String!
    desc:String
  }

  input updateEventInput{
    title:String
    desc:String
  }

  #Participant
  
  type Participant {
     id: ID!,
     user_id: ID!,
     event_id: ID!
  }

  input createParticipantInput{
     user_id: ID!,
     event_id: ID!
  }

  input updateParticipantInput{
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

    createLocation(data:createLocationInput): Location
    updateLocation(id:ID!,data:updateLocationInput): Location
    deletedLocation(id:ID,name:String): Location
    deletedAllLocation:allDeleted

    createEvent(data:createEventInput): Event
    updateEvent(id:ID!,data:updateEventInput): Event
    deletedEvent(id:ID,title:String): Event
    deletedAllEvent:allDeleted

    createParticipant(data:createParticipantInput): Participant
    updateParticipant(id:ID!,data:updateParticipantInput): Participant
    deletedParticipant(id:ID,event_id:ID): Participant
    deletedAllParticipant:allDeleted
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

    //** Users *********************

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
    },

    //** Location *********************
    createLocation: (parent, { data }) => {
      const location_input = { id: nanoid(), ...data };
      locations.push(location_input);
      return location_input
    },
    updateLocation: (parent, { id, data }) => {
      const locationIndex = locations.findIndex(location => location.id == id)
      locationIndex === -1 && new Error("Not Found")
      return locations[locationIndex] = { ...locations[locationIndex], ...data }
    },
    deletedLocation: (parent, { id, name }) => {
      const locationIndex = locations.findIndex(index => index.id == id || index.name == name)
      locationIndex === -1 && new Error("not found")
      locations.splice(locationIndex, 1)
      return locations[locationIndex]
    },

    deletedAllLocation: () => {
      const length = locations.length
      locations.splice(0, length)
      return { count: length }
    },

    //** Event *********************

    createEvent: (parent, { data }) => {
      const event_input = { id: nanoid(), ...data };
      events.push(event_input);
      return event_input
    },

    updateEvent: (parent, { id, data }) => {
      const eventIndex = events.findIndex(event => event.id == id)
      eventIndex === -1 && new Error("Not Found")
      return events[eventIndex] = { ...events[eventIndex], ...data }
    },

    deletedEvent: (parent, { id, title }) => {
      const eventIndex = events.findIndex(index => index.id == id || index.title == title)
      eventIndex === -1 && new Error("not found")
      events.splice(eventIndex, 1)
      return events[eventIndex]
    },

    deletedAllEvent: () => {
      const length = events.length
      events.splice(0, length)
      return { count: length }
    },

    //** Participant *********************

    createParticipant: (parent, { data }) => {
      const participant_input = { id: nanoid(), ...data };
      participants.push(participant_input);
      return participant_input
    },

    updateParticipant: (parent, { id, data }) => {
      const participantIndex = participants.findIndex(participant => participant.id == id)
      participantIndex === -1 && new Error("Not Found")
      return participants[participantIndex] = { ...participants[participantIndex], ...data }
    },

    deletedParticipant: (parent, { id, user_id }) => {
      const participantIndex = participants.findIndex(index => index.id == id || index.user_id == user_id)
      participantIndex === -1 && new Error("not found")
      participants.splice(participantIndex, 1)
      return participants[participantIndex]
    },

    deletedAllParticipant: () => {
      const length = participants.length
      participants.splice(0, length)
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