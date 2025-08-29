const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY});

const cohortChatGtpIndex = pc.Index('gtp-clone')

async function createMemory({vectors,metadata,messageId}){
   await cohortChatGtpIndex.upsert([{
    id:messageId,
    values: vectors,
    metadata
   }])
}

async function queryMemory({queryVector, limit=5,metadata}){
    const data = await cohortChatGtpIndex.query({
        vector:queryVector,
        topK : limit,
        filter:metadata ? {metadata} : undefined ,
        includeMetadata : true
    })

    return data.matches
}

module.exports = {
    createMemory,
    queryMemory
}