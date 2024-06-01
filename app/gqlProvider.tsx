'use client'

import { PropsWithChildren, useMemo } from 'react'
import {
  UrqlProvider,
  ssrExchange,
  fetchExchange,
  createClient,
  gql,
} from '@urql/next'

import { cacheExchange } from '@urql/exchange-graphcache'

import { url } from '@/utils/url'
import { getToken } from '@/utils/token'

// takes children as parameter because it's a provider
const GQLProvider = ({children}: PropsWithChildren) => { 
    //strategy is to keep the same client for the whole app to avoid having to 
    //create a new cache/redux everytime. We want the whole app to experience the same cache
    //This is the client side but side note: server side, you want a new client every request becuase you 
    //dont want users to share the same cache *security risk*

    //useMemo is a hook that memoizes a function
    //momoizing functions means if a function is called with same parameters more than once,
    //it will not compute and return what it computed the first time
    const[client, ssr] = useMemo(()=>{

   
        // ssr plugin makes sure this isn't breakable on the server
        // ssr safely transfers the cache from the server side rendering to the client side rendering 
        //on HYDRATION
        // What is HYDRATION? : An object that gets created on the server with all the data 
        //you've made that gets passed to frontend. Exchange of data over the network layer

        const ssr = ssrExchange({ // exchange is a plugin. AKA a Link in Appollo
        isClient: typeof window !== 'undefined',
        })
    
        const client = createClient({
            url, //graphql
            exchanges: [cacheExchange({}), ssr, fetchExchange],
            fetchOptions: () => {
                const token = getToken()

                return token 
                    ? {headers: {authoriztion: 'Bearer ${token}' }}
                    : {}
            },
        })

        return [client, ssr]

    }, [ ])//[ ] is a dependency array. Needed because this is a hook

    return (
        <UrqlProvider client={client} ssr={ssr}>
            {children}
        </UrqlProvider>
    )
}

export default GQLProvider