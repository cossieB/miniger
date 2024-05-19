import { useParams } from "@solidjs/router"
import { createResource } from "solid-js"
import { getFilmsByTag } from "../../api/data"
import { Movies } from "../../components/Movies"

export function MoviesByTagPage() {
    const params = useParams()
    const [films] = createResource(() => params.tag, () => getFilmsByTag(params.tag))

    return <Movies films={films} />
}