import { useNavigate, useSearchParams } from "react-router";

import { SearchBar, type SearchValues } from "@/components/form/search-bar";
import { readHomeSearch, writeHomeSearch } from "@/lib/home-search";

// Barre de recherche de l'en-tête : lit et écrit la recherche de l'accueil dans l'URL.
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
