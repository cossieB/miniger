/* @refresh reload */
import { render } from "solid-js/web";
import "./App.css";
import App from "./App";
import { Route, Router } from "@solidjs/router";
import Database from "@tauri-apps/plugin-sql";
import { createResource } from "solid-js";
import Actors from "./routes/Actors";
import Studios from "./routes/Studios";
import { getActors, getFilms, getFilmsByActor, getFilmsByStudio, getFilmsByTag, getInaccessible, getStudios } from "./api/data";
import 'ag-grid-community/styles/ag-grid.css'; // grid core CSS
import "ag-grid-community/styles/ag-theme-alpine.css"; // optional theme
import { Movies } from "./routes/Movies";
import Inaccessible from "./routes/Inaccessible";

export const [db] = createResource(() => Database.load("sqlite:mngr.db"))

render(() => (
    <Router root={App}>
        <Route path="/" component={() => <p>Index</p>} />
        <Route path="/movies"  >
            <Route
                path="/"
                component={() => <Movies fetcher={() => getFilms()} />}
                preload={void getFilms}
            />
            <Route
                path="/tags/:tag"
                component={(props) => <Movies fetcher={() => getFilmsByTag(props.params.tag)} />}
                preload={(args) => getFilmsByTag(args.params.tag)}
            />
            <Route
                path="/actors/:actorId"
                component={props => <Movies fetcher={() => getFilmsByActor(Number(props.params.actorId))} />}
                preload={(args) => getFilmsByActor(Number(args.params.actorId))}
            />
            <Route
                path="/studios/:studioId"
                component={props => <Movies fetcher={() => getFilmsByStudio(Number(props.params.studioId))} />}
                preload={args => getFilmsByStudio(Number(args.params.studioId))}
            />
        </Route>
        <Route path={["/actors", "/movies/actors"]} component={Actors} preload={() => getActors()} />
        <Route path={["/studios", "/movies/studios"]} component={Studios} preload={() => getStudios()} />
        <Route path="/movies/inaccessible" component={Inaccessible} preload={() => getInaccessible()} />
    </Router>
), document.getElementById("root") as HTMLElement);


