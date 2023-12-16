import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { users } from './data';

const typeDefs = gql`
    
    type User {
        id:ID!
        username:String!
    }
    
    type Query {
        users:[User!]!
    }

`

const resolvers = {
    Query:{
        users:()=>users
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);