/* @refresh reload */
import { render } from "solid-js/web";
import "./App.css";
import MainWindow from "./windows/MainWindow";
import { Navigate, Route, Router } from "@solidjs/router";
import Actors from "./routes/Actors";
import Studios from "./routes/Studios";
import { getActors, getCostars, getFilms, getInaccessible, getMoviesByCostars, getPairings, getStudios } from "./api/data";
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
import { Costars } from "./routes/Costars";
import { Search } from "./routes/Search";
import { search } from "./repositories/search";
import { Thumbnails } from "./routes/Thumbs";
import Transcode from "./routes/Transcode";
import { getId } from "./utils/getIdFromParam";


render(() => (
    <Router  >
        <Route component={MainWindow}>
            <Route path="/" component={Home} />
            <Route path="/movies">
                <Route
                    path="/"
                    component={() => <Movies fetcher={() => getFilms()} />}
                    preload={() => void getFilms()}
                />
                <Route
                    path="/tags/:tag"
                    component={(props) => <Movies fetcher={() => getFilms({tags: [decodeURI(props.params.tag!)]})} />}
                    preload={(args) => void getFilms({tags: [decodeURI(args.params.tag!)]})}
                />
                <Route
                    path="/actors/:actor"
                    component={props => <Movies fetcher={() => getFilms({actorIds: [getId(props.params.actor!, "/movies")]})} />}
                    preload={(args) => void getFilms({actorIds: [getId(args.params.actor!, "/movies")]})}
                />
                <Route
                    path="/actors/:actor/:costar"
                    component={props => <Movies fetcher={() => getMoviesByCostars(props.params.actor!, props.params.costar!)} />}
                    preload={(args) => void getMoviesByCostars(args.params.actor!, args.params.costar!)}
                />
                <Route
                    path="/studios/:studio"
                    component={props => <Movies fetcher={() => getFilms({studioId: getId(props.params.studio!, "/studios")})} />}
                    preload={args => void getFilms({studioId: getId(args.params.studio!, "/studios")})}
                />
                <Route
                    path="/inaccessible"
                    component={Inaccessible}
                    preload={() => void getInaccessible()}
                />
                <Route
                    path="/search"
                    component={props => <Movies fetcher={() => search()} />}
                />
            </Route>
            <Route path="/actors" >
                <Route path="/" component={Actors} preload={() => void getActors()} />
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
            <Route path="/play" component={VideoPlayer} />
            <Route path="/search" component={Search} />
        </Route>
        <Route path="/settings" component={Settings} />
        <Route path="/convert" component={Convert} />
        <Route path="/dragdrop" component={DragDrop} />
        <Route path="/splash" component={Splash} />
        <Route path="/thumbs" component={Thumbnails} />
        <Route path="/transcode" component={Transcode} />

        {/* Redirects */}
        <Route path="/movies/actors" component={() => <Navigate href="/actors" />} />
        <Route path="/movies/studios" component={() => <Navigate href="/studios" />} />
        <Route path={["/movies/tags", "/tags"]} component={() => <Navigate href="/movies" />} />
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
