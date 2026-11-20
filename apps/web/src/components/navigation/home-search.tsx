import { useNavigate, useSearchParams } from "react-router";

import { SearchBar, type SearchValues } from "@/components/form/search-bar";
import { readHomeSearch, writeHomeSearch } from "@/lib/home-search";

function HomeSearch() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { q, city, from, category } = readHomeSearch(params);

  const onSearch = (values: SearchValues) =>
    navigate({ pathname: "/", search: writeHomeSearch({ ...values, category }).toString() });

  return (
    <SearchBar
      key={[q, city, from].join("|")}
      defaultValues={{ q, city, from }}
      onSearch={onSearch}
    />
  );
}

export { HomeSearch };
