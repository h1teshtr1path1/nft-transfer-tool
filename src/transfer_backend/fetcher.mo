import A "mo:base/AssocList";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Int16 "mo:base/Int16";
import Int8 "mo:base/Int8";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Prelude "mo:base/Prelude";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import Trie2D "mo:base/Trie";

actor Fetcher {
    type TokenIdentifier  = Text;
    type TokenIndex = Nat32;
    type AccountIdentifier = Text;

    private func key(x : Nat32) : Trie.Key<Nat32> {
        return { hash = x; key = x };
    };
    private func keyT(x : Text) : Trie.Key<Text> {
        return { hash = Text.hash(x); key = x };
    };
    public query func cycleBalance() : async Nat {
        Cycles.balance();
    };
    public func wallet_receive() : async Nat{
        Cycles.accept(Cycles.available())
    };
    public func getTokenBalance(_collection : Text, _owner : Text) : async([TokenIndex]){
        var buffer : Buffer.Buffer<TokenIndex> = Buffer.Buffer<TokenIndex>(0);
        let collection = actor (_collection) : actor { getRegistry : () -> async [(TokenIndex, AccountIdentifier)]};
        var _registry : [(TokenIndex, AccountIdentifier)] = await collection.getRegistry();
        for((index, add) in _registry.vals()){
            if(add == _owner){
                buffer.add(index);
            }
        };
        return Buffer.toArray(buffer);
    };
};