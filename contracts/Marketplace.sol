pragma solidity 0.4.19;
import 'land/contracts/LANDRegistry.sol';
import 'mana/contracts/MANAToken.sol';

contract Marketplace {
    MANAToken mana;
    LANDRegistry land;

    mapping (uint256 => address) seller;
    mapping (uint256 => uint256) offer;
    mapping (uint256 => uint256) expiration;

    Marketplace(address _mana, address _land) {
        mana = (MANAToken) _mana;
        land = (MANAToken) _land;
    }

    function offer(uint256 assetId, uint256 manaWeiPrice, uint256 expiration) {
        require(land.isApprovedFor(msg.sender, assetId));

        seller[assetId] = land.holderOf(assetId);
        offer[assetId] = manaWeiPrice;
        expiry[assetId] = expiration;
    }

    function buy(uint256 assetId) {
        require(land.isApprovedFor(this, assetId));
        require(offer[assetId] > 0);
        require(now < expiration[assetId]);
        require(land.holderOf(assetId) == seller[assetId]);

        mana.transferFrom(msg.sender, land.holderOf(assetId). offer[assetId]);
        land.transfer(assetId, msg.sender);
        clear(assetId);
    }

    function clear(uint256 assetId) {
        require(now >= expiration[assetId] || land.holderOf(assetId) != seller[assetId] || land.isApprovedFor(msg.sender, assetId));
        seller[assetId] = 0;
        offer[assetId] = 0;
        expiration[assetId] = 0;
    }
}
