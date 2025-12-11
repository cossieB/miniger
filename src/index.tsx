/* @refresh reload */
import { render } from "solid-js/web";
import "./App.css";
import MainWindow from "./windows/MainWindow";
import { Navigate, Route, Router } from "@solidjs/router";
import Actors from "./routes/Actors";
import Studios from "./routes/Studios";
import { getActors, getCostars, getFilms, getFilmsByActor, getFilmsByStudio, getFilmsByTag, getInaccessible, getMoviesByCostars, getPairings, getStudios, getTags } from "./api/data";
import 'ag-grid-community/styles/ag-grid.css'; // grid core CSS
import "ag-grid-community/styles/ag-theme-alpine.css"; // optional theme
import { Movies } from "./routes/Movies";
import Inaccessible from "./routes/Inaccessible";
import { VideoPlayer } from "./components/VideoPlayer/VideoPlayer";
import { Home } from "./routes/Home";
import { Settings } from "./windows/Settings";
import { Convert } from "./windows/Convert";
import { DragDrop } from "./windows/DragDrop";
import { readSession } from "./readSettings";
import { Tags } from "./routes/Tags";
import { Costars } from "./routes/Costars";
import { Search } from "./routes/Search";
import { search } from "./repositories/search";
import { Thumbnails as Thumbnails } from "./routes/Thumbs";

render(() => (
    <Router  >
        <Route component={MainWindow}>
            <Route path="/" component={Home} />
            <Route path="/movies">
                <Route
                    path="/"
                    component={() => <Movies fetcher={() => getFilms()} />}
                    preload={void getFilms}
                />
                <Route
                    path="/tags/:tag"
                    component={(props) => <Movies fetcher={() => getFilmsByTag(props.params.tag!)} />}
                    preload={(args) => getFilmsByTag(args.params.tag!)}
                />
                <Route
                    path="/actors/:actor"
                    component={props => <Movies fetcher={() => getFilmsByActor(props.params.actor!)} />}
                    preload={(args) => getFilmsByActor(args.params.actor!)}
                />
                <Route
                    path="/actors/:actor/:costar"
                    component={props => <Movies fetcher={() => getMoviesByCostars(props.params.actor!, props.params.costar!)} />}
                    preload={(args) => getMoviesByCostars(args.params.actor!, args.params.costar!)}
                />
                <Route
                    path="/studios/:studio"
                    component={props => <Movies fetcher={() => getFilmsByStudio(props.params.studio!)} />}
                    preload={args => getFilmsByStudio(args.params.studio!)}
                />
                <Route
                    path="/inaccessible"
                    component={Inaccessible}
                    preload={() => getInaccessible()}
                />
                <Route
                    path="/search"
                    component={props => <Movies fetcher={() => search(props.params.filters)} />}
                />
            </Route>
            <Route path="/actors" >
                <Route path="/" component={Actors} preload={() => getActors()} />
                <Route path=":a" component={() => <Navigate href={"/actors"} />} />
            </Route>
            <Route path="/costars">
                <Route
                    path="/"
                    component={() => <Costars fetcher={() => getPairings()} />}
                />
                <Route
                    path="/:actor"
                    component={props => <Costars fetcher={() => getCostars(props.params.actor!)} />}
                />
            </Route>
            <Route path="/studios" component={Studios} preload={() => getStudios()} />
            <Route path="/tags" component={Tags} preload={() => getTags()} />
            <Route path="/play" component={VideoPlayer} />
            <Route path="/search" component={Search} />
        </Route>
        <Route path="/settings" component={Settings} />
        <Route path="/convert" component={Convert} />
        <Route path="/dragdrop" component={DragDrop} />
        <Route path="/splash" component={Splash} />
        <Route path="/thumbs" component={Thumbnails} />

        {/* Redirects */}
        <Route path="/movies/actors" component={() => <Navigate href="/actors" />} />
        <Route path="/movies/studios" component={() => <Navigate href="/studios" />} />
        <Route path="/movies/tags" component={() => <Navigate href="/tags" />} />
    </Router>
), document.getElementById("root") as HTMLElement);


function Splash() {
    readSession()
    return (
        <main class="w-screen h-screen flex items-center justify-center">
            <img class="animate-[spin_5s_linear_infinite] " src="/tauri.svg" />
        </main>
    )
}
