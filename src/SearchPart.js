import React, { useCallback, useMemo, useState } from "react";
import { Grid, Search, Segment } from "semantic-ui-react";
import { debounce } from "lodash-es";
import { useSubstrate } from "./substrate-lib";

export default function SearchPart() {
  const { api } = useSubstrate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [block, setBlock] = useState(null);

  const _searchBlock = useCallback(
    debounce(async (value) => {
      if (value === "") {
        setBlock(null);
        return;
      }

      setIsSearching(true);
      const isBlockHash = /^0x/.test(value);
      const {
        rpc: { chain },
      } = api;
      let block;

      try {
        if (isBlockHash) {
          block = await chain.getBlock(value);
        } else {
          const blockHash = await chain.getBlockHash(value);
          block = await chain.getBlock(blockHash);
        }
      } catch (e) {
        console.log(e);
      }

      setIsSearching(false);
      setBlock(block);
    }, 500),
    [api]
  );

  const onSearchChange = useCallback((e) => {
    const {
      target: { value },
    } = e;

    setSearchValue(value);
    _searchBlock(value);
  }, [_searchBlock]);

  const searchContent = useMemo(() => {
    return (
      block && (
        <Segment>
          <pre style={{ overflowX: "auto" }}>
            {JSON.stringify(block, null, 2)}
          </pre>
        </Segment>
      )
    );
  }, [block]);

  return (
    <Grid.Column>
      <h1>Search Block</h1>
      <Search
        open={false}
        loading={isSearching}
        size="big"
        placeholder="Search block"
        value={searchValue}
        onSearchChange={onSearchChange}
      ></Search>
      {searchContent}
    </Grid.Column>
  );
}
