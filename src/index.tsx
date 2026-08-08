/* @refresh reload */
import { render } from "solid-js/web";
import "./styles/index.css"
import { Navigate, Route, Router } from "@solidjs/router";
import Actors from "./routes/Actors";
import Studios from "./routes/Studios";
import { Movies } from "./routes/Movies";
import Inaccessible from "./routes/Inaccessible";
import { Home } from "./routes/Home";
import { Costars } from "./routes/Costars";
import { Search } from "./routes/Search";
import { search } from "./repositories/search";
import { Thumbnails } from "./routes/Thumbs";
import Transcode from "./routes/Transcode";
import { getId } from "./utils/getIdFromParam";
import MainWindow from "./layouts/main-window/MainWindow";
import { getActors, getPairings } from "./features/actors/api";
import { VideoPlayer } from "./features/media/components/VideoPlayer";
import { getFilms, getMoviesByCostars, getInaccessible } from "./features/movies";
import { getStudios } from "./features/studios/api";
import { readSession } from "./hooks/useStorage";
import { Convert } from "./layouts/secondary-windows/Convert";
import { DragDrop } from "./layouts/secondary-windows/DragDrop";
import { TagsRoute } from "./routes/Tags";
import { getTags } from "./features/tags/api";
import { Settings } from "./layouts/secondary-windows/Settings";


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
                    component={props => <Costars fetcher={() => getPairings(props.params.actor!)} />}
                />
            </Route>
            <Route path="/studios" component={Studios} preload={() => getStudios()} />
            <Route path="/tags" component={TagsRoute} preload={() => getTags()} />
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
        <Route path={"/movies/tags"} component={() => <Navigate href="/tags" />} />
    </Router>
), document.getElementById("root") as HTMLElement);


function Splash() {
    readSession()
    return (
        <main class="splash-screen flexCenter">
            <img src="/tauri.svg" />
        </main>
    )
}
