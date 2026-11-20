import { useNavigate, useSearchParams } from "react-router";

import { SearchBar, type SearchValues } from "@/components/form/search-bar";
import { readHomeSearch, writeHomeSearch } from "@/lib/home-search";

function HomeSearch() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { q, city, from, to, category, sort } = readHomeSearch(params);

  const onSearch = (values: SearchValues) =>
    navigate({ pathname: "/", search: writeHomeSearch({ ...values, category, sort }).toString() });

  return (
    <SearchBar
      key={[q, city, from, to].join("|")}
      defaultValues={{ q, city, from, to }}
      onSearch={onSearch}
    />
  );
}

export { HomeSearch };
