import { useParams } from "@solidjs/router"
import { createResource } from "solid-js"
import { getFilmsByActor } from "../../api/data"
import { Movies } from "../../components/Movies"

export function MoviesByActorPage() {
    const params = useParams()
    const [films] = createResource(() => params.actorId, () => getFilmsByActor(Number(params.actorId)))

    return <Movies films={films} />
}