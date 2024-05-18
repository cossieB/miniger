/* @refresh reload */
import { render } from "solid-js/web";
import "./App.css";
import App from "./App";
import { Route, Router } from "@solidjs/router";
import { MoviePage, MoviesPage } from "./routes/Movies/Movies";
import Database from "@tauri-apps/plugin-sql";
import { createResource } from "solid-js";
import Inaccessible from "./routes/Movies/Inaccessible";
import Actors from "./routes/Actors";
import Studios from "./routes/Studios";
import { getActors, getFilms, getFilmsByTag, getInaccessible, getStudios } from "./api/data";

export const [db] = createResource(() => Database.load("sqlite:mngr.db"))

render(() => (
    <Router root={App}>
        <Route path="/" component={() => <p>Index</p>} />
        <Route path="/movies"  >
            <Route path="/" component={MoviesPage} load={void getFilms} />
            <Route path="/tags/:tag" component={MoviePage} load={(args) => getFilmsByTag(args.params.tag)} />
        </Route>
        <Route path="/actors" component={Actors} load={() => getActors()} />
        <Route path="/studios" component={Studios} load={() => getStudios()} />
        <Route path="/movies/inaccessible" component={Inaccessible} load={() => getInaccessible()} />
    </Router>
), document.getElementById("root") as HTMLElement);


