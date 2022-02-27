//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract ProfileImageNfts is ERC721, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256; //An uint256 variable can call up functions in the Strings library. One example can be, value.toString(). An uint256 can be easily converted into a string. How convenient.

    Counters.Counter _tokenIds;

    mapping(uint256 => string) _tokenURIs;

    struct RenderToken{
        uint256 id;
        string uri;
        string space;
    }

    //call ERC721 constructor pass(name,symbol)
    constructor() ERC721("ProfileImageNfts", "PIN"){
       
    }
    
    function _setTokenURI (uint256 tokenId, string memory _tokenURI) internal {
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns(string memory){
        require (_exists(tokenId), "URI does not exist on that ID");
        string memory _RUri = _tokenURIs[tokenId];
        return _RUri;
    }

    function getAllToken() public view returns (RenderToken[] memory) {
        uint256 latestId = _tokenIds.current();
        RenderToken[] memory res = new RenderToken[](latestId);
        for(uint256 i=0; i<=latestId; i++){
            if(_exists(i)){//_exists is built in function 
                string memory uri = tokenURI(i);
                res[i] = RenderToken(i, uri, " ");
            }
        }

        return res;
    }

    //create mint function
    function mint(address recipients, string memory _uri) public returns(uint256){
        uint256 newId = _tokenIds.current();
        _mint(recipients, newId);//_safeMint is built in function
        _setTokenURI(newId,_uri);
        _tokenIds.increment();
        /* 
            Once the token is minted and its tokenURI is set, we increment the _tokenIds by 1, 
            so that the next minted token has a new token id.
        */ 
        return newId;
    }
}