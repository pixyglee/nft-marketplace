export const getCreators = (nfts) => {
    const creators = nfts.reduce((creatorObject, nft) => {
        const creator = creatorObject[nft.seller] || [];
        creator.push(nft);
        creatorObject[nft.seller] = creator;
        return creatorObject;
    }, {});

    const result = Object.entries(creators).map((creator) => {
        const seller = creator[0];
        const sum = creator[1].map((item) => Number(item.price)).reduce((prev, curr) => prev + curr, 0);
        return { seller, sum };
    });

   // console.log(result);
    return result;
}
