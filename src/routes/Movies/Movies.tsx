import { createResource } from "solid-js"
import { getFilms } from "../../api/data"
import { Movies } from "../../components/Movies"

export function MoviesPage() {
    const [films] = createResource(async () => getFilms());

    return <Movies films={films} />
}

